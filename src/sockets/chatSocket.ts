import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { socketAuth } from "../middlewares/socketAuth";
import logger from "../config/logger";
import { v4 as uuidv4 } from "uuid";
import { Knex } from "knex";

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
    };

    socket.on("authenticate", async () => {
      if (socket.data.user && socket.data.connection) {
        await updateUserStatus(socket.data.user.id, true);
        socket.join(socket.data.user.id.toString());
      }
    });

    socket.on("requestInitialUsers", async () => {
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
    });

    socket.on("fetchChatHistory", async ({ userId }) => {
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
    });

    socket.on("sendMessage", async ({ toUserId, message }) => {
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
    });

    socket.on("deleteMessage", async ({ messageId }) => {
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
    });

    socket.on("forwardMessage", async ({ toUserIds, messageId }) => {
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
    });

    socket.on("createGroup", async ({ groupName, userIds }) => {
      if (socket.data.user && socket.data.connection) {
        const groupId = uuidv4();
        await socket.data.connection("groups").insert({
          id: groupId,
          name: groupName,
          creator_id: socket.data.user.id,
          created_at: new Date(),
        });

        const groupUsers = userIds.map((userId: string) => ({
          group_id: groupId,
          user_id: userId,
        }));

        await socket.data.connection("group_users").insert(groupUsers);

        io.emit("groupCreated", {
          id: groupId,
          name: groupName,
          users: userIds,
        });
      }
    });

    socket.on("sendGroupMessage", async ({ groupId, message }) => {
      if (socket.data.user && socket.data.connection) {
        const newMessage = {
          id: uuidv4(),
          group_id: groupId,
          from_user_id: socket.data.user.id,
          message,
          timestamp: new Date(),
        };

        await socket.data.connection("group_messages").insert(newMessage);

        const groupUsers = await socket.data
          .connection("group_users")
          .where({ group_id: groupId })
          .select("user_id");

        groupUsers.forEach(({ user_id }: any) => {
          io.to(user_id.toString()).emit("receiveGroupMessage", newMessage);
        });
      }
    });

    socket.on("fetchGroupChatHistory", async ({ groupId }) => {
      if (socket.data.user && socket.data.connection) {
        const groupChatHistory = await socket.data
          .connection("group_messages")
          .where({ group_id: groupId })
          .orderBy("timestamp", "asc");

        socket.emit("groupChatHistory", groupChatHistory);
      }
    });

    socket.on("requestInitialGroups", async () => {
      if (socket.data.user && socket.data.connection) {
        const groups = await socket.data
          .connection("groups")
          .select("id", "name", "creator_id", "created_at");

        const groupUsers = await socket.data
          .connection("group_users")
          .select("group_id", "user_id");

        const userGroups = groups.map((group: any) => {
          const users = groupUsers
            .filter((gu: any) => gu.group_id === group.id)
            .map((gu: any) => gu.user_id);
          return {
            ...group,
            users,
          };
        });

        socket.emit("initialGroups", userGroups);
      }
    });

    socket.on("addUserToGroup", async ({ groupId, userId }) => {
      if (socket.data.user && socket.data.connection) {
        await socket.data.connection("group_users").insert({
          group_id: groupId,
          user_id: userId,
        });

        io.emit("userAddedToGroup", {
          groupId,
          userId,
        });
      }
    });

    socket.on("removeUserFromGroup", async ({ groupId, userId }) => {
      if (socket.data.user && socket.data.connection) {
        await socket.data
          .connection("group_users")
          .where({ group_id: groupId, user_id: userId })
          .del();

        io.emit("userRemovedFromGroup", {
          groupId,
          userId,
        });
      }
    });

    socket.on("deleteGroup", async ({ groupId }) => {
      if (socket.data.user && socket.data.connection) {
        await socket.data
          .connection("group_users")
          .where({ group_id: groupId })
          .del();
        await socket.data
          .connection("group_messages")
          .where({ group_id: groupId })
          .del();
        await socket.data.connection("groups").where({ id: groupId }).del();

        io.emit("groupDeleted", {
          groupId,
        });
      }
    });

    socket.on("logout", () => {
      if (socket.data.user && socket.data.connection) {
        const userId = socket.data.user.id;
        loggedOutUsers.add(userId);
        updateUserStatus(userId, false);
      }
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
  });
};
