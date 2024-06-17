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

    const sendUnreadMessagesCount = async (userId: string) => {
      try {
        const unreadMessages = await socket.data
          .connection("messages")
          .select("fromUserId")
          .count("id as count")
          .where({ toUserId: userId, read: false })
          .groupBy("fromUserId");

        const unreadGroupMessagesData = await socket.data
          .connection("group_messages")
          .leftJoin(
            "group_users",
            "group_messages.group_id",
            "group_users.group_id",
          )
          .select("group_messages.group_id", "group_messages.read_by")
          .where("group_users.user_id", userId)
          .andWhere("group_users.is_active", true);

        const unreadGroupMessagesFiltered = unreadGroupMessagesData.filter(
          (message: any) => !message.read_by.includes(userId),
        );

        const unreadMessagesMap = unreadMessages.reduce(
          (
            acc: Record<string, number>,
            { fromUserId, count }: { fromUserId: string; count: number },
          ) => {
            acc[fromUserId] = count;
            return acc;
          },
          {},
        );

        // Group and count unread messages by group_id
        const unreadGroupMessagesMap = unreadGroupMessagesFiltered.reduce(
          (acc: any, message: any) => {
            if (!acc[message.group_id]) {
              acc[message.group_id] = 0;
            }
            acc[message.group_id]++;
            return acc;
          },
          {},
        );

        socket.emit("unreadMessagesCount", {
          unreadMessagesMap,
          unreadGroupMessagesMap,
        });
      } catch (error) {
        handleError(error, "Error sending unread messages count");
      }
    };

    const handleDisconnect = () => {
      if (socket.data.user && socket.data.connection) {
        const userId = socket.data.user.id;

        if (loggedOutUsers.has(userId)) {
          loggedOutUsers.delete(userId);
          logger.info("Client disconnected after logout");
        } else {
          const timeoutId = setTimeout(async () => {
            await updateUserStatus(userId, false);
            disconnectTimeouts.delete(userId);
            logger.info("Client disconnected due to inactivity");
          }, 10000);

          disconnectTimeouts.set(userId, timeoutId);
        }
      }
    };

    socket.on("authenticate", async () => {
      try {
        if (socket.data.user && socket.data.connection) {
          await updateUserStatus(socket.data.user.id, true);
          socket.join(socket.data.user.id.toString());
          await sendUnreadMessagesCount(socket.data.user.id);
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
          const chatHistoryQuery = socket.data
            .connection("messages")
            .leftJoin(
              "user_messages",
              "messages.id",
              "user_messages.message_id",
            )
            .where((builder: Knex.QueryBuilder) =>
              builder
                .where("fromUserId", socket.data.user.id)
                .andWhere("toUserId", userId)
                .orWhere((builder: Knex.QueryBuilder) =>
                  builder
                    .where("fromUserId", userId)
                    .andWhere("toUserId", socket.data.user.id),
                ),
            )
            .andWhere((builder: Knex.QueryBuilder) =>
              builder
                .whereNull("user_messages.user_id")
                .orWhere("user_messages.user_id", "!=", socket.data.user.id),
            )
            .orderBy("messages.timestamp", "asc");

          const chatHistory = await chatHistoryQuery;

          socket.emit("chatHistory", chatHistory);
        }
      } catch (error) {
        handleError(error, "Error fetching chat history");
      }
    });

    socket.on("getUnreadMessages", async () => {
      try {
        await sendUnreadMessagesCount(socket.data.user.id);
      } catch (error) {
        handleError(error, "Error fetching unread messages");
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

    socket.on("messageRead", async ({ fromUserId, groupId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          if (fromUserId) {
            await socket.data
              .connection("messages")
              .where({ fromUserId, toUserId: socket.data.user.id, read: false })
              .update({ read: true });

            await sendUnreadMessagesCount(socket.data.user.id);
          }

          if (groupId) {
            const unreadMessages = await socket.data
              .connection("group_messages")
              .where("group_id", groupId)
              .whereNot(
                socket.data.connection.raw("read_by @> ?", [
                  JSON.stringify([socket.data.user.id]),
                ]),
              );

            const updatePromises = unreadMessages.map(async (message: any) => {
              const updatedReadBy = [
                ...(message.read_by || []),
                socket.data.user.id,
              ];
              await socket.data
                .connection("group_messages")
                .where({ id: message.id })
                .update({ read_by: JSON.stringify(updatedReadBy) });
            });

            await Promise.all(updatePromises);

            await sendUnreadMessagesCount(socket.data.user.id);
          }
        }
      } catch (error) {
        handleError(error, "Error marking message as read");
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
            read_by: JSON.stringify([socket.data.user.id]),
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
            .where({ group_id: groupId, is_active: true })
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
          const userGroup = await socket.data
            .connection("group_users")
            .where({ group_id: groupId, user_id: socket.data.user.id })
            .first();

          if (!userGroup) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found in group");
          }

          let groupChatHistoryQuery = socket.data
            .connection("group_messages")
            .leftJoin(
              "user_group_messages",
              "group_messages.id",
              "user_group_messages.group_message_id",
            )
            // .where("group_messages.group_id", groupId)
            // .andWhere((builder: Knex.QueryBuilder) =>
            //   builder
            //     .whereNull("user_group_messages.user_id")
            //     .orWhere(
            //       "user_group_messages.user_id",
            //       "!=",
            //       socket.data.user.id,
            //     ),
            // )
            .orderBy("group_messages.timestamp", "asc");

          if (userGroup.disable_date) {
            groupChatHistoryQuery = groupChatHistoryQuery.andWhere(
              "group_messages.timestamp",
              "<=",
              userGroup.disable_date,
            );
          }

          const groupChatHistory = await groupChatHistoryQuery;

          const filteredGroupChatHistory = groupChatHistory.filter(
            (msg: any) => {
              const relatedMessages = groupChatHistory.filter(
                (m: any) => m.group_message_id === msg.id,
              );
              return !relatedMessages.some(
                (m: any) => m.user_id === socket.data.user.id,
              );
            },
          );

          const userIds = filteredGroupChatHistory.map(
            (msg: any) => msg.from_user_id,
          );
          const uniqueUserIds = [...new Set(userIds)];
          const users = await socket.data
            .connection("users")
            .whereIn("id", uniqueUserIds)
            .select("id", "firstname", "lastname", "profileImage");

          const groupMembers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId, is_active: true });

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

          const modifiedGroupChatHistory = filteredGroupChatHistory.map(
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

          const disabledGroups = await socket.data
            .connection("group_users")
            .where({ user_id: socket.data.user.id, is_active: false })
            .select("group_id");

          const disabledGroupIds = disabledGroups.map(
            (group: any) => group.group_id,
          );

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

          socket.emit("initialGroups", {
            groups: userGroupsWithUsers,
            disabledGroups: disabledGroupIds,
          });
        }
      } catch (error) {
        handleError(error, "Error requesting initial groups");
      }
    });

    socket.on("addUserToGroup", async ({ groupId, userId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const existingUser = await socket.data
            .connection("group_users")
            .where({ group_id: groupId, user_id: userId, is_active: false })
            .first();

          if (existingUser) {
            await socket.data
              .connection("group_users")
              .where({
                group_id: existingUser.group_id,
                user_id: existingUser.user_id,
              })
              .update({ is_active: true, disable_date: null });
          } else {
            await socket.data.connection("group_users").insert({
              group_id: groupId,
              user_id: userId,
            });
          }

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

          const group = await socket.data
            .connection("groups")
            .where({ id: groupId })
            .first();

          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId })
            .select("user_id");

          const groupDetails = {
            id: group.id,
            name: group.name,
            users: groupUsers.map((member: any) => member.user_id),
            image: group.image,
          };

          groupUsers.forEach(({ user_id }: any) => {
            io.to(user_id.toString()).emit("userAddedToGroup", {
              groupId,
              userId,
              user,
            });
          });

          io.to(userId.toString()).emit("groupCreated", groupDetails);
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
              .update({ is_active: false, disable_date: new Date() });

            groupUsers.forEach(({ user_id }: any) => {
              io.to(user_id.toString()).emit("userRemovedFromGroup", {
                groupId,
                userId,
              });
            });

            io.to(userId.toString()).emit("groupDisabled", { groupId });
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
          const userId = socket.data.user.id;

          const groupUser = await socket.data
            .connection("group_users")
            .where({ group_id: groupId, user_id: userId })
            .first();

          if (!groupUser) {
            throw new ApiError(httpStatus.NOT_FOUND, "User not found in group");
          }

          if (groupUser.is_active === false) {
            await socket.data
              .connection("group_users")
              .where({ group_id: groupId, user_id: userId })
              .del();

            socket.emit("groupDeletedForUser", { groupId });
          } else {
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

    socket.on(
      "deleteGroupMessageForEveryone",
      async ({ messageId, groupId }) => {
        try {
          if (socket.data.user && socket.data.connection) {
            const message = await socket.data
              .connection("group_messages")
              .where({ id: messageId, group_id: groupId })
              .first();

            if (message && message.from_user_id === socket.data.user.id) {
              await socket.data
                .connection("group_messages")
                .where({ id: messageId, group_id: groupId })
                .del();

              const groupUsers = await socket.data
                .connection("group_users")
                .where({ group_id: groupId })
                .select("user_id");

              groupUsers.forEach(({ user_id }: { user_id: string }) => {
                io.to(user_id.toString()).emit(
                  "groupMessageDeletedForEveryone",
                  { messageId },
                );
              });
            }
          }
        } catch (error) {
          handleError(error, "Error deleting group message for everyone");
        }
      },
    );

    socket.on("deleteGroupMessageForMe", async ({ messageId, groupId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const message = await socket.data
            .connection("group_messages")
            .where({ id: messageId, group_id: groupId })
            .first();
          if (message) {
            await socket.data.connection("user_group_messages").insert({
              user_id: socket.data.user.id,
              group_message_id: messageId,
            });

            socket.emit("groupMessageDeletedForMe", { messageId });
          }
        }
      } catch (error) {
        handleError(error, "Error deleting group message for user");
      }
    });

    socket.on("deleteMessageForEveryone", async ({ messageId, userId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          const message = await socket.data
            .connection("messages")
            .where({
              id: messageId,
              toUserId: userId,
              fromUserId: socket.data.user.id,
            })
            .first();

          if (message) {
            await socket.data
              .connection("messages")
              .where({ id: messageId })
              .del();

            io.to(userId.toString()).emit("messageDeletedForEveryone", {
              messageId,
            });
            io.to(socket.data.user.id.toString()).emit(
              "messageDeletedForEveryone",
              { messageId },
            );
          }
        }
      } catch (error) {
        handleError(error, "Error deleting message for everyone");
      }
    });

    socket.on("deleteMessageForMe", async ({ messageId }) => {
      try {
        if (socket.data.user && socket.data.connection) {
          await socket.data.connection("user_messages").insert({
            user_id: socket.data.user.id,
            message_id: messageId,
          });

          socket.emit("messageDeletedForMe", { messageId });
        }
      } catch (error) {
        handleError(error, "Error deleting message for user");
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
                .update({ is_active: false, disable_date: new Date() });

              groupUsers.forEach(({ user_id }: any) => {
                io.to(user_id.toString()).emit("userRemovedFromGroup", {
                  groupId,
                  userId,
                });
              });

              io.to(userId.toString()).emit("groupDisabled", { groupId });
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

    socket.on("disconnect", handleDisconnect);

    socket.on("startTyping", async ({ groupId, userId }: any) => {
      try {
        if (groupId) {
          const groupUsers = await socket.data
            .connection("group_users")
            .where({ group_id: groupId, is_active: true })
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
