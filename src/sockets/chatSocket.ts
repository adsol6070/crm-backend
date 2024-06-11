import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { socketAuth } from "../middlewares/socketAuth";
import logger from "../config/logger";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import { chatService } from "../services";

const disconnectTimeouts = new Map();
const loggedOutUsers = new Set();

export const setupChatSocket = (
  httpServer: ReturnType<typeof createServer>,
) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket: Socket) => {
    logger.info("Client connected");

    if (disconnectTimeouts.has(socket.data.user.id)) {
      clearTimeout(disconnectTimeouts.get(socket.data.user.id));
      disconnectTimeouts.delete(socket.data.user.id);
    }

    const updateUserStatus = async (userId: string, status: boolean) => {
      try {
        if (socket.data.user && socket.data.connection) {
          await socket.data
            .connection("users")
            .where({ id: userId })
            .update({ online: status, last_active: new Date() });
          const user = await socket.data
            .connection("users")
            .where({ id: userId })
            .first();
          io.emit("userStatusUpdated", {
            userId,
            status,
            description: status
              ? "Online"
              : "Last seen at " +
                new Date(user.last_active).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
          });
        }
      } catch (error) {
        handleError(error, "Error updating user status");
      }
    };

    socket.on("authenticate", async () => {
      try {
        if (socket.data.user && socket.data.connection) {
          await updateUserStatus(socket.data.user.id, true);
          socket.join(socket.data.user.id.toString());
        }
      } catch (error) {
        handleError(error, "Error during authentication");
      }
    });

    socket.on("requestInitialUsers", async () => {
      try {
        if (socket.data.user && socket.data.connection) {
          const users = await socket.data
            .connection("users")
            .select(
              "id",
              "firstname",
              "lastname",
              "profileImage",
              "online",
              "last_active",
            );

          socket.emit("initialUsers", users);
        }
      } catch (error) {
        handleError(error, "Error requesting initial users");
      }
    });

    socket.on("fetchChatHistory", async ({ userId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const chatHistory = await socket.data
            .connection("messages")
            .where(function (this: Knex.QueryBuilder) {
              this.where("fromUserId", socket.data.user.id)
                .andWhere("toUserId", userId)
                .orWhere("fromUserId", userId)
                .andWhere("toUserId", socket.data.user.id);
            })
            .orderBy("timestamp", "asc");

          socket.emit("chatHistory", chatHistory);
        }
      } catch (error) {
        handleError(error, "Error fetching chat history");
      }
    });

    socket.on("sendMessage", async ({ toUserId, message }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const newMessage = {
            id: uuidv4(),
            fromUserId: socket.data.user.id,
            toUserId,
            message,
            timestamp: new Date(),
          };

          await socket.data.connection("messages").insert(newMessage);

          if (toUserId === socket.data.user.id) {
            io.to(toUserId.toString()).emit("receiveMessage", newMessage);
          } else {
            io.to(toUserId.toString()).emit("receiveMessage", newMessage);
            io.to(socket.data.user.id.toString()).emit(
              "receiveMessage",
              newMessage,
            );
          }
          socket.emit("messageSent", newMessage);
        }
      } catch (error) {
        handleError(error, "Error sending message");
      }
    });

    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const message = await socket.data
            .connection("messages")
            .where({ id: messageId })
            .first();
          if (message) {
            await socket.data
              .connection("messages")
              .where({ id: messageId })
              .del();

            io.to(message.fromUserId.toString()).emit("messageDeleted", {
              messageId,
            });
            io.to(message.toUserId.toString()).emit("messageDeleted", {
              messageId,
            });
          }
        }
      } catch (error) {
        handleError(error, "Error deleting message");
      }
    });

    socket.on("deleteGroupMessageForUser", async ({ messageId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          await socket.data
            .connection("group_messages")
            .where({ id: messageId, from_user_id: socket.data.user.id })
            .del();

          socket.emit("groupMessageDeletedForUser", { messageId });
        }
      } catch (error) {
        handleError(error, "Error deleting group message for user");
      }
    });

    socket.on("forwardMessage", async ({ toUserIds, messageId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const message = await socket.data
            .connection("messages")
            .where({ id: messageId })
            .first();
          if (message) {
            const newMessages = toUserIds.map((toUserId: string) => ({
              id: uuidv4(),
              fromUserId: socket.data.user.id,
              toUserId,
              message: message.message,
              timestamp: new Date(),
            }));

            await socket.data.connection("messages").insert(newMessages);

            toUserIds.forEach((toUserId: string) => {
              socket.to(toUserId.toString()).emit("receiveMessage", {
                ...newMessages.find((msg: any) => msg.toUserId === toUserId),
              });
            });
          }
        }
      } catch (error) {
        handleError(error, "Error forwarding message");
      }
    });

    socket.on(
      "createGroup",
      async ({ tenantID, groupName, userIds, image }) => {
        try {
          if (socket.data.user && socket.data.connection) {
            const groupId = uuidv4();
            await socket.data.connection("groups").insert({
              id: groupId,
              tenantID,
              name: groupName,
              creator_id: socket.data.user.id,
              created_at: new Date(),
              image,
            });

            const groupUsers = userIds.map((userId: string) => ({
              group_id: groupId,
              user_id: userId,
            }));

            await socket.data.connection("group_users").insert(groupUsers);

            const groupDetails = await socket.data
              .connection("groups")
              .where({ id: groupId })
              .first();

            const groupMembers = await socket.data
              .connection("users")
              .whereIn(
                "id",
                groupUsers.map((member: any) => member.user_id),
              )
              .select(
                "id",
                "firstname",
                "lastname",
                "online",
                "last_active",
                "profileImage",
              );

            userIds.forEach((userId: string) => {
              io.to(userId.toString()).emit("groupCreated", {
                id: groupId,
                name: groupName,
                users: userIds,
                image,
                members: groupMembers,
              });
            });
          }
        } catch (error) {
          handleError(error, "Error creating group");
        }
      },
    );

    socket.on("sendGroupMessage", async ({ groupId, message }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const newMessage = {
            id: uuidv4(),
            group_id: groupId,
            from_user_id: socket.data.user.id,
            message,
            timestamp: new Date(),
          };

          await socket.data.connection("group_messages").insert(newMessage);

          const user = await socket.data
            .connection("users")
            .where({ id: socket.data.user.id })
            .first();

          const messageWithUser = {
            ...newMessage,
            user: {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
            },
          };

          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          groupUsers.forEach(({ user_id }: any) => {
            io.to(user_id.toString()).emit(
              "receiveGroupMessage",
              messageWithUser,
            );
          });
        }
      } catch (error) {
        handleError(error, "Error sending group message");
      }
    });

    socket.on("fetchGroupChatHistory", async ({ groupId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const groupChatHistory = await socket.data
            .connection("group_messages")
            .where({ group_id: groupId })
            .orderBy("timestamp", "asc");

          const userIds = groupChatHistory.map((msg: any) => msg.from_user_id);
          const uniqueUserIds = [...new Set(userIds)];
          const users = await socket.data
            .connection("users")
            .whereIn("id", uniqueUserIds)
            .select("id", "firstname", "lastname");

          const groupMembers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId });

          const memberDetails = await socket.data
            .connection("users")
            .whereIn(
              "id",
              groupMembers.map((member: any) => member.user_id),
            )
            .select(
              "id",
              "firstname",
              "lastname",
              "online",
              "last_active",
              "profileImage",
            );

          const userMap = users.reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return acc;
          }, {});

          const modifiedGroupChatHistory = groupChatHistory.map(
            ({ from_user_id, ...chat }: any) => ({
              ...chat,
              fromUserId: from_user_id,
              user: userMap[from_user_id],
            }),
          );

          socket.emit("groupChatHistory", {
            chatHistory: modifiedGroupChatHistory,
            members: memberDetails,
          });
        }
      } catch (error) {
        handleError(error, "Error fetching group chat history");
      }
    });

    socket.on("requestInitialGroups", async () => {
      try {
        if (socket.data.user && socket.data.connection) {
          const userGroups = await socket.data
            .connection("group_users")
            .where({ user_id: socket.data.user.id })
            .select("group_id");

          const groupIds = userGroups.map((group: any) => group.group_id);

          const groups = await socket.data
            .connection("groups")
            .whereIn("id", groupIds)
            .select("id", "name", "creator_id", "created_at", "image");

          const groupUsers = await socket.data
            .connection("group_users")
            .whereIn("group_id", groupIds)
            .select("group_id", "user_id");

          const userGroupsWithUsers = await Promise.all(
            groups.map(async (group: any) => {
              const users = await socket.data
                .connection("users")
                .whereIn(
                  "id",
                  groupUsers
                    .filter((gu: any) => gu.group_id === group.id)
                    .map((gu: any) => gu.user_id),
                )
                .select(
                  "id",
                  "firstname",
                  "lastname",
                  "online",
                  "last_active",
                  "profileImage",
                );

              return {
                ...group,
                users: groupUsers
                  .filter((gu: any) => gu.group_id === group.id)
                  .map((gu: any) => gu.user_id),
                members: users,
              };
            }),
          );

          socket.emit("initialGroups", userGroupsWithUsers);
        }
      } catch (error) {
        handleError(error, "Error requesting initial groups");
      }
    });

    socket.on("addUserToGroup", async ({ groupId, userId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          await socket.data.connection("group_users").insert({
            group_id: groupId,
            user_id: userId,
          });

          const user = await socket.data
            .connection("users")
            .where({ id: userId })
            .select(
              "id",
              "firstname",
              "lastname",
              "online",
              "last_active",
              "profileImage",
            )
            .first();

          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          groupUsers.forEach(({ user_id }: any) => {
            io.to(user_id.toString()).emit("userAddedToGroup", {
              groupId,
              userId,
              user,
            });
          });
        }
      } catch (error) {
        handleError(error, "Error adding user to group");
      }
    });

    socket.on("removeUserFromGroup", async ({ groupId, userId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          if (groupUsers.length === 1 && groupUsers[0].user_id === userId) {
            socket.emit("confirmDeleteLastUser", {
              groupId,
              userId,
            });
          } else {
            await socket.data
              .connection("group_users")
              .where({ group_id: groupId, user_id: userId })
              .del();

            groupUsers.forEach(({ user_id }: any) => {
              io.to(user_id.toString()).emit("userRemovedFromGroup", {
                groupId,
                userId,
              });
            });
          }
        }
      } catch (error) {
        handleError(error, "Error removing user from group");
      }
    });

    socket.on("confirmDeleteGroup", async ({ groupId, userId, confirmed }) => {
      try {
        if (confirmed) {
          const group = await socket.data
            .connection("groups")
            .where({ id: groupId })
            .first();

          if (!group) {
            throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
          }

          await socket.data
            .connection("group_users")
            .where({ group_id: groupId, user_id: userId })
            .del();

          await socket.data.connection("groups").where({ id: groupId }).del();

          await socket.data
            .connection("group_messages")
            .where({ group_id: groupId })
            .del();

          await chatService.deleteGroupImage(group.tenantID, group.image);

          io.emit("groupDeleted", {
            groupId,
          });
        }
      } catch (error) {
        handleError(error, "Error confirming group deletion");
      }
    });

    socket.on("deleteGroup", async ({ groupId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const group = await socket.data
            .connection("groups")
            .where({ id: groupId })
            .first();

          if (!group) {
            throw new ApiError(httpStatus.NOT_FOUND, "Group not found");
          }

          await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .del();

          await socket.data
            .connection("group_messages")
            .where({ group_id: groupId })
            .del();

          await socket.data.connection("groups").where({ id: groupId }).del();

          await chatService.deleteGroupImage(group.tenantID, group.image);

          io.emit("groupDeleted", {
            groupId,
          });
        }
      } catch (error) {
        handleError(error, "Error deleting group");
      }
    });

    socket.on("transferGroupOwnership", async ({ groupId, newOwnerId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const group = await socket.data
            .connection("groups")
            .where({ id: groupId })
            .first();
          if (group.creator_id === socket.data.user.id) {
            const groupUsers = await socket.data
              .connection("group_users")
              .where({ group_id: groupId })
              .select("user_id");

            await socket.data
              .connection("groups")
              .where({ id: groupId })
              .update({
                creator_id: newOwnerId,
              });

            groupUsers.forEach(({ user_id }: any) => {
              io.to(user_id.toString()).emit("groupOwnershipTransferred", {
                groupId,
                newOwnerId,
              });
            });

            await socket.data
              .connection("group_users")
              .where({ group_id: groupId, user_id: socket.data.user.id })
              .del();

            groupUsers.forEach(({ user_id }: any) => {
              io.to(user_id.toString()).emit("userLeftGroup", {
                groupId,
                userId: socket.data.user.id,
              });
            });
          }
        }
      } catch (error) {
        handleError(error, "Error transferring group ownership");
      }
    });

    socket.on("leaveGroup", async ({ groupId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          const userId = socket.data.user.id;
          const group = await socket.data
            .connection("groups")
            .where({ id: groupId })
            .first();

          if (groupUsers.length === 1 && groupUsers[0].user_id === userId) {
            socket.emit("confirmDeleteLastUser", { groupId, userId });
          } else {
            if (group.creator_id === userId) {
              socket.emit("promptSelectNewOwner", { groupId });
            } else {
              await socket.data
                .connection("group_users")
                .where({ group_id: groupId, user_id: userId })
                .del();

              groupUsers.forEach(({ user_id }: any) => {
                io.to(user_id.toString()).emit("userLeftGroup", {
                  groupId,
                  userId,
                });
              });
            }
          }
        }
      } catch (error) {
        handleError(error, "Error leaving group");
      }
    });

    socket.on("logout", () => {
      if (socket.data.user && socket.data.connection) {
        const userId = socket.data.user.id;
        loggedOutUsers.add(userId);
        updateUserStatus(userId, false);
      }
    });

    socket.on("ping", () => {
      socket.emit("pong");
    });

    socket.on("disconnect", () => {
      if (socket.data.user && socket.data.connection) {
        const userId = socket.data.user.id;

        if (loggedOutUsers.has(userId)) {
          loggedOutUsers.delete(userId);
          logger.info("Client disconnected after logout");
        } else {
          const timeoutId = setTimeout(async () => {
            await updateUserStatus(userId, false);
            disconnectTimeouts.delete(userId);
            logger.info("Client disconnected");
          }, 10000); // 10 seconds delay

          disconnectTimeouts.set(userId, timeoutId);
        }
      }
    });

    socket.on("startTyping", async ({ groupId, userId }: any) => {
      try {
        if (groupId) {
          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          groupUsers.forEach(({ user_id }: any) => {
            if (user_id !== socket.data.user.id) {
              io.to(user_id.toString()).emit("typing", {
                user: socket.data.user,
                groupId,
                isGroup: true,
              });
            }
          });
        } else {
          socket.to(userId.toString()).emit("typing", {
            user: socket.data.user,
            userId,
            isGroup: false,
          });
        }
      } catch (error) {
        handleError(error, "Error handling startTyping event");
      }
    });

    socket.on("stopTyping", async ({ groupId, userId }) => {
      try {
        if (groupId) {
          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          groupUsers.forEach(({ user_id }: any) => {
            if (user_id !== socket.data.user.id) {
              io.to(user_id.toString()).emit("stopTyping", {
                user: socket.data.user,
                groupId,
                isGroup: true,
              });
            }
          });
        } else {
          socket.to(userId).emit("stopTyping", {
            user: socket.data.user,
            userId,
            isGroup: false,
          });
        }
      } catch (error) {
        handleError(error, "Error handling stopTyping event");
      }
    });
  });
};

function handleError(error: unknown, context: string) {
  if (error instanceof Error) {
    logger.error(`${context}: ${error.message}`);
  } else {
    logger.error(`${context}: An unknown error occurred`);
  }
}
