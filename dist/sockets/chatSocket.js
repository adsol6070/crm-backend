"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupChatSocket = void 0;
const socket_io_1 = require("socket.io");
const socketAuth_1 = require("../middlewares/socketAuth");
const logger_1 = __importDefault(require("../config/logger"));
const uuid_1 = require("uuid");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const services_1 = require("../services");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const disconnectTimeouts = new Map();
const loggedOutUsers = new Set();
const setupChatSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });
    io.use(socketAuth_1.socketAuth);
    io.on("connection", (socket) => {
        logger_1.default.info("Client connected");
        if (disconnectTimeouts.has(socket.data.user.id)) {
            clearTimeout(disconnectTimeouts.get(socket.data.user.id));
            disconnectTimeouts.delete(socket.data.user.id);
        }
        const updateUserStatus = async (userId, status) => {
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
            }
            catch (error) {
                handleError(error, "Error updating user status");
            }
        };
        const sendUnreadMessagesCount = async (userId) => {
            try {
                const unreadMessages = await socket.data
                    .connection("messages")
                    .select("fromUserId")
                    .count("id as count")
                    .where({ toUserId: userId, read: false })
                    .groupBy("fromUserId");
                const unreadGroupMessagesData = await socket.data
                    .connection("group_messages")
                    .leftJoin("group_users", "group_messages.group_id", "group_users.group_id")
                    .select("group_messages.group_id", "group_messages.read_by")
                    .where("group_users.user_id", userId)
                    .andWhere("group_users.is_active", true);
                const unreadGroupMessagesFiltered = unreadGroupMessagesData.filter((message) => !message.read_by.includes(userId));
                const unreadMessagesMap = unreadMessages.reduce((acc, { fromUserId, count }) => {
                    acc[fromUserId] = count;
                    return acc;
                }, {});
                // Group and count unread messages by group_id
                const unreadGroupMessagesMap = unreadGroupMessagesFiltered.reduce((acc, message) => {
                    if (!acc[message.group_id]) {
                        acc[message.group_id] = 0;
                    }
                    acc[message.group_id]++;
                    return acc;
                }, {});
                socket.emit("unreadMessagesCount", {
                    unreadMessagesMap,
                    unreadGroupMessagesMap,
                });
            }
            catch (error) {
                handleError(error, "Error sending unread messages count");
            }
        };
        const sendNotification = async (userId, notification) => {
            try {
                await socket.data.connection("message_notifications").insert({
                    id: notification.id,
                    user_id: userId,
                    name: notification.name,
                    subText: notification.subText,
                    avatar: notification.avatar,
                    createdAt: notification.createdAt,
                    read: false,
                });
                io.to(userId.toString()).emit("messageNotification", notification);
            }
            catch (error) {
                handleError(error, "Error sending notification");
            }
        };
        const handleDisconnect = () => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const userId = socket.data.user.id;
                    if (loggedOutUsers.has(userId)) {
                        loggedOutUsers.delete(userId);
                        logger_1.default.info("Client disconnected after logout");
                    }
                    else {
                        const timeoutId = setTimeout(async () => {
                            await updateUserStatus(userId, false);
                            disconnectTimeouts.delete(userId);
                            logger_1.default.info("Client disconnected due to inactivity");
                        }, 10000);
                        disconnectTimeouts.set(userId, timeoutId);
                    }
                }
            }
            catch (error) {
                handleError(error, "Error handling disconnect event");
            }
        };
        socket.on("authenticate", async () => {
            try {
                if (socket.data.user && socket.data.connection) {
                    await updateUserStatus(socket.data.user.id, true);
                    socket.join(socket.data.user.id.toString());
                    await sendUnreadMessagesCount(socket.data.user.id);
                }
            }
            catch (error) {
                handleError(error, "Error during authentication");
            }
        });
        socket.on("requestInitialNotifications", async () => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const leadNotications = await socket.data
                        .connection("lead_notifications")
                        .where({ user_id: socket.data.user.id })
                        .select("*")
                        .orderBy("created_at", "desc");
                    socket.emit("initialNotifications", leadNotications);
                }
            }
            catch (error) {
                console.error("Error requesting initial notifications:", error);
            }
        });
        socket.on("clearAllNotifications", async () => {
            try {
                if (socket.data.connection && socket.data.user) {
                    await socket.data
                        .connection("lead_notifications")
                        .where({ user_id: socket.data.user.id })
                        .del();
                    socket.emit("notificationsCleared");
                }
            }
            catch (error) {
                console.error("Error clearing notifications:", error);
            }
        });
        socket.on("requestInitialUsers", async () => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const users = await socket.data
                        .connection("users")
                        .select("id", "firstname", "lastname", "profileImage", "online", "last_active");
                    socket.emit("initialUsers", users);
                }
            }
            catch (error) {
                handleError(error, "Error requesting initial users");
            }
        });
        socket.on("requestInitialMessageNotifications", async () => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const notifications = await socket.data
                        .connection("message_notifications")
                        .where({ user_id: socket.data.user.id })
                        .orderBy("createdAt", "desc");
                    socket.emit("initialMessageNotifications", notifications);
                }
            }
            catch (error) {
                handleError(error, "Error requesting initial message notifications");
            }
        });
        socket.on("clearAllMessageNotifications", async () => {
            try {
                if (socket.data.connection && socket.data.user) {
                    await socket.data
                        .connection("message_notifications")
                        .where({ user_id: socket.data.user.id })
                        .del();
                    socket.emit("notificationsCleared");
                }
            }
            catch (error) {
                handleError(error, "Error clearing all notifications");
            }
        });
        socket.on("fetchChatHistory", async ({ userId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const chatHistoryQuery = socket.data
                        .connection("messages")
                        .leftJoin("user_messages", "messages.id", "user_messages.message_id")
                        .where((builder) => builder
                        .where((builder) => builder
                        .where("fromUserId", socket.data.user.id)
                        .andWhere("toUserId", userId))
                        .orWhere((builder) => builder
                        .where("fromUserId", userId)
                        .andWhere("toUserId", socket.data.user.id)))
                        .orderBy("messages.timestamp", "asc");
                    const chatHistory = await chatHistoryQuery;
                    const filteredChatHistory = chatHistory.filter((msg) => {
                        const relatedMessages = chatHistory.filter((m) => m.message_id === msg.id);
                        return !relatedMessages.some((m) => m.user_id === socket.data.user.id);
                    });
                    socket.emit("chatHistory", filteredChatHistory);
                }
            }
            catch (error) {
                handleError(error, "Error fetching chat history");
            }
        });
        socket.on("getUnreadMessages", async () => {
            try {
                await sendUnreadMessagesCount(socket.data.user.id);
            }
            catch (error) {
                handleError(error, "Error fetching unread messages");
            }
        });
        socket.on("sendMessage", async ({ toUserId, message }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const newMessage = {
                        id: (0, uuid_1.v4)(),
                        fromUserId: socket.data.user.id,
                        toUserId,
                        message,
                        timestamp: new Date(),
                    };
                    await socket.data.connection("messages").insert(newMessage);
                    const notification = {
                        id: (0, uuid_1.v4)(),
                        name: `${socket.data.user.firstname} ${socket.data.user.lastname}`,
                        subText: message,
                        avatar: "",
                        createdAt: new Date(),
                    };
                    await sendNotification(toUserId, notification);
                    if (toUserId === socket.data.user.id) {
                        io.to(toUserId.toString()).emit("receiveMessage", newMessage);
                    }
                    else {
                        io.to(toUserId.toString()).emit("receiveMessage", newMessage);
                        io.to(socket.data.user.id.toString()).emit("receiveMessage", newMessage);
                    }
                }
            }
            catch (error) {
                handleError(error, "Error sending message");
            }
        });
        socket.on("sendFileMessage", async (data) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const { toUserId, message, fileUrl, fileType, fileName, fileSize, fromUserId, } = data;
                    const newMessage = {
                        id: (0, uuid_1.v4)(),
                        fromUserId,
                        toUserId,
                        message,
                        file_url: fileUrl,
                        file_type: fileType,
                        file_name: fileName,
                        file_size: fileSize,
                    };
                    await socket.data.connection("messages").insert(newMessage);
                    if (toUserId === socket.data.user.id) {
                        io.to(toUserId.toString()).emit("receiveMessage", newMessage);
                    }
                    else {
                        io.to(toUserId.toString()).emit("receiveMessage", newMessage);
                        io.to(socket.data.user.id.toString()).emit("receiveMessage", newMessage);
                    }
                }
            }
            catch (error) {
                console.error("Error sending file message:", error);
            }
        });
        socket.on("sendGroupFileMessage", async (data) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const { groupId, message, fileUrl, fileType, fileName, fileSize, fromUserId, } = data;
                    const newMessage = {
                        id: (0, uuid_1.v4)(),
                        group_id: groupId,
                        from_user_id: fromUserId,
                        message,
                        file_url: fileUrl,
                        file_type: fileType,
                        file_name: fileName,
                        file_size: fileSize,
                        read_by: JSON.stringify([fromUserId]),
                    };
                    await socket.data.connection("group_messages").insert(newMessage);
                    const user = await socket.data
                        .connection("users")
                        .where({ id: fromUserId })
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
                    groupUsers.forEach(({ user_id }) => {
                        io.to(user_id.toString()).emit("receiveGroupMessage", messageWithUser);
                        const notification = {
                            id: (0, uuid_1.v4)(),
                            name: `${user.firstname} ${user.lastname}`,
                            subText: "Sent a file",
                            avatar: "",
                            createdAt: new Date(),
                        };
                        sendNotification(user_id, notification);
                    });
                }
            }
            catch (error) {
                console.error("Error sending group file message:", error);
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
                            .whereNot(socket.data.connection.raw("read_by @> ?", [
                            JSON.stringify([socket.data.user.id]),
                        ]));
                        const updatePromises = unreadMessages.map(async (message) => {
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
            }
            catch (error) {
                handleError(error, "Error marking message as read");
            }
        });
        /*
        
    
        Use Case 1. The sender Forward the Message to their own
           e.g. toUserIds ["senderId"]
           ToUsersIds: [ '14e9bef1-26b0-415e-a5ac-02f47bafa502' ]
        Use Case 2. The sender Forward the Message to other person including own
           e.g. toUserIds ["senderId", "other1"]
           ToUsersIds: ['14e9bef1-26b0-415e-a5ac-02f47bafa502', '29a6df70-a6d2-49f8-a84b-9e9ee3024eca']
        Use Case 3. The sender Forward the Message to other person excluding own
           e.g. toUserIds ["other1", "other2"]
    
        */
        socket.on("forwardMessage", async ({ toUserIds, messageId, isGroup }) => {
            try {
                // console.log("ToUsersIds:", toUserIds);
                if (socket.data.user && socket.data.connection) {
                    let message;
                    if (isGroup) {
                        message = await socket.data
                            .connection("group_messages")
                            .where({ id: messageId })
                            .first();
                        console.log("GroupMessage part called:", message);
                    }
                    else {
                        message = await socket.data
                            .connection("messages")
                            .where({ id: messageId })
                            .first();
                        console.log("Message part called:", message);
                    }
                    if (message) {
                        let newFileName = null;
                        if (message.file_url && message.file_type && message.file_name) {
                            const tenantID = socket.data.user.tenantID;
                            const originalFilePath = path_1.default.join(__dirname, "..", "uploads", tenantID, "ChatMessageFiles", message.file_url);
                            const timestamp = Date.now();
                            newFileName = `chatFile-${timestamp}-${message.file_name}`;
                            const newFilePath = path_1.default.join(__dirname, "..", "uploads", tenantID, "ChatMessageFiles", newFileName);
                            fs_1.default.copyFileSync(originalFilePath, newFilePath);
                        }
                        const newMessages = toUserIds.map((toUserId) => ({
                            id: (0, uuid_1.v4)(),
                            fromUserId: socket.data.user.id,
                            toUserId,
                            message: message.message,
                            file_url: newFileName ? newFileName : message.file_url,
                            file_type: message.file_type,
                            file_name: message.file_name,
                            timestamp: new Date(),
                        }));
                        await socket.data.connection("messages").insert(newMessages);
                        console.log("ToUserIds:", toUserIds.length);
                        if (toUserIds.length === 1) {
                            if (toUserIds[0] === socket.data.user.id) {
                                io.to(socket.data.user.id.toString()).emit("receiveMessage", {
                                    ...newMessages[0],
                                });
                            }
                            else {
                                io.to(socket.data.user.id.toString()).emit("receiveMessage", {
                                    ...newMessages[0],
                                });
                                io.to(toUserIds[0]).emit("receiveMessage", {
                                    ...newMessages[0],
                                });
                            }
                        }
                        else {
                            // Block for forwarding to multiple users
                            toUserIds.forEach((toUserId) => {
                                if (toUserId === socket.data.user.id) {
                                    io.to(toUserId.toString()).emit("receiveMessage", {
                                        ...newMessages.find((msg) => msg.toUserId === toUserId),
                                    });
                                }
                                else {
                                    io.to(socket.data.user.id.toString()).emit("receiveMessage", {
                                        ...newMessages.find((msg) => msg.toUserId === toUserId),
                                    });
                                    io.to(toUserId.toString()).emit("receiveMessage", {
                                        ...newMessages.find((msg) => msg.toUserId === toUserId),
                                    });
                                }
                            });
                        }
                        // if (
                        //   toUserIds.length === 1 &&
                        //   toUserIds[0] === socket.data.user.id
                        // ) {
                        //   // Case 1: toUserIds only contains the sender's ID
                        //   io.to(socket.data.user.id.toString()).emit("receiveMessage", {
                        //     ...newMessages.find(
                        //       (msg: any) => msg.toUserId === socket.data.user.id,
                        //     ),
                        //   });
                        // } else {
                        //   // Case 2: toUserIds contains other IDs as well
                        //   toUserIds.forEach((toUserId: string) => {
                        //     const notification = {
                        //       id: uuidv4(),
                        //       name: `${socket.data.user.firstname} ${socket.data.user.lastname}`,
                        //       subText: message.message,
                        //       avatar: "",
                        //       createdAt: new Date(),
                        //     };
                        //     sendNotification(toUserId, notification);
                        //     io.to(toUserId.toString()).emit("receiveMessage", {
                        //       ...newMessages.find((msg: any) => msg.toUserId === toUserId),
                        //     });
                        //   });
                        //   if (
                        //     toUserIds.length > 1 &&
                        //     toUserIds.includes(socket.data.user.id)
                        //   ) {
                        //     io.to(socket.data.user.id.toString()).emit("receiveMessage", {
                        //       ...newMessages.find(
                        //         (msg: any) =>
                        //           msg.fromUserId === socket.data.user.id &&
                        //           msg.toUserId === toUserIds[0],
                        //       ),
                        //     });
                        //   }
                        //   if (!toUserIds.includes(socket.data.user.id)) {
                        //     io.to(socket.data.user.id.toString()).emit("receiveMessage", {
                        //       ...newMessages.find(
                        //         (msg: any) =>
                        //           msg.fromUserId === socket.data.user.id &&
                        //           msg.toUserId === toUserIds[0],
                        //       ),
                        //     });
                        //   }
                        // }
                    }
                }
            }
            catch (error) {
                handleError(error, "Error forwarding message");
            }
        });
        socket.on("createGroup", async ({ tenantID, groupName, userIds, image }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const groupId = (0, uuid_1.v4)();
                    await socket.data.connection("groups").insert({
                        id: groupId,
                        tenantID,
                        name: groupName,
                        creator_id: socket.data.user.id,
                        created_at: new Date(),
                        image,
                    });
                    const groupUsers = userIds.map((userId) => ({
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
                        .whereIn("id", groupUsers.map((member) => member.user_id))
                        .select("id", "firstname", "lastname", "online", "last_active", "profileImage");
                    userIds.forEach((userId) => {
                        io.to(userId.toString()).emit("groupCreated", {
                            id: groupId,
                            name: groupName,
                            users: userIds,
                            image,
                            members: groupMembers,
                        });
                        const notification = {
                            id: (0, uuid_1.v4)(),
                            name: `${socket.data.user.firstname} ${socket.data.user.lastname}`,
                            subText: `You have been added to the group: ${groupName}`,
                            avatar: "",
                            createdAt: new Date(),
                        };
                        sendNotification(userId, notification);
                    });
                }
            }
            catch (error) {
                handleError(error, "Error creating group");
            }
        });
        socket.on("sendGroupMessage", async ({ groupId, message }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const newMessage = {
                        id: (0, uuid_1.v4)(),
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
                    groupUsers.forEach(({ user_id }) => {
                        io.to(user_id.toString()).emit("receiveGroupMessage", messageWithUser);
                        const notification = {
                            id: (0, uuid_1.v4)(),
                            name: `${socket.data.user.firstname} ${socket.data.user.lastname}`,
                            subText: message,
                            avatar: user.profileImage || "",
                            createdAt: new Date(),
                        };
                        sendNotification(user_id, notification);
                    });
                }
            }
            catch (error) {
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
                        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found in group");
                    }
                    let groupChatHistoryQuery = socket.data
                        .connection("group_messages")
                        .leftJoin("user_group_messages", "group_messages.id", "user_group_messages.group_message_id")
                        .where("group_messages.group_id", groupId)
                        .andWhere((query) => {
                        query
                            .where("excluded_user_id", "!=", socket.data.user.id)
                            .orWhereNull("excluded_user_id");
                    })
                        .orderBy("group_messages.timestamp", "asc");
                    if (userGroup.disable_date) {
                        groupChatHistoryQuery = groupChatHistoryQuery.andWhere("group_messages.timestamp", "<=", userGroup.disable_date);
                    }
                    const groupChatHistory = await groupChatHistoryQuery;
                    console.log("GroupChatHistory:", groupChatHistory);
                    const personalNotifications = await socket.data
                        .connection("personal_notifications")
                        .where({ user_id: socket.data.user.id, group_id: groupId })
                        .orderBy("created_at", "asc");
                    console.log("PersonalNotifications:", personalNotifications);
                    const filteredGroupChatHistory = groupChatHistory.filter((msg) => {
                        const relatedMessages = groupChatHistory.filter((m) => m.group_message_id === msg.id);
                        return !relatedMessages.some((m) => m.user_id === socket.data.user.id);
                    });
                    const combinedHistory = [
                        ...filteredGroupChatHistory,
                        ...personalNotifications.map((notification) => ({
                            id: notification.id,
                            group_id: notification.group_id,
                            from_user_id: null,
                            message: notification.message,
                            system: true,
                            excluded_user_id: null,
                            timestamp: notification.created_at,
                        })),
                    ];
                    combinedHistory.sort((a, b) => {
                        const dateA = new Date(a.timestamp).getTime();
                        const dateB = new Date(b.timestamp).getTime();
                        return dateA - dateB;
                    });
                    console.log("CombinedHistory:", combinedHistory);
                    const userIds = combinedHistory.map((msg) => msg.from_user_id);
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
                        .whereIn("id", groupMembers.map((member) => member.user_id))
                        .select("id", "firstname", "lastname", "online", "last_active", "profileImage");
                    const userMap = users.reduce((acc, user) => {
                        acc[user.id] = user;
                        return acc;
                    }, {});
                    const modifiedGroupChatHistory = combinedHistory.map(({ from_user_id, ...chat }) => ({
                        ...chat,
                        fromUserId: from_user_id,
                        user: userMap[from_user_id],
                    }));
                    socket.emit("groupChatHistory", {
                        groupId,
                        chatHistory: modifiedGroupChatHistory,
                        members: memberDetails,
                    });
                }
            }
            catch (error) {
                handleError(error, "Error fetching group chat history");
            }
        });
        socket.on("requestInitialGroups", async () => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const userGroups = await socket.data
                        .connection("group_users")
                        .where({ user_id: socket.data.user.id })
                        .select("group_id", "is_active", "removed_by_admin");
                    const groupIds = userGroups.map((group) => group.group_id);
                    const groups = await socket.data
                        .connection("groups")
                        .whereIn("id", groupIds)
                        .select("id", "name", "creator_id", "created_at", "image");
                    const groupUsers = await socket.data
                        .connection("group_users")
                        .whereIn("group_id", groupIds)
                        .select("group_id", "user_id");
                    const disabledGroups = userGroups.filter((group) => !group.is_active);
                    const disabledGroupIds = disabledGroups.map((group) => group.group_id);
                    const userGroupsWithUsers = await Promise.all(groups.map(async (group) => {
                        const users = await socket.data
                            .connection("users")
                            .whereIn("id", groupUsers
                            .filter((gu) => gu.group_id === group.id)
                            .map((gu) => gu.user_id))
                            .select("id", "firstname", "lastname", "online", "last_active", "profileImage");
                        return {
                            ...group,
                            users: groupUsers
                                .filter((gu) => gu.group_id === group.id)
                                .map((gu) => gu.user_id),
                            members: users,
                        };
                    }));
                    socket.emit("initialGroups", {
                        groups: userGroupsWithUsers,
                        disabledGroups: disabledGroups.map((group) => ({
                            groupId: group.group_id,
                            removedByAdmin: group.removed_by_admin,
                        })),
                    });
                }
            }
            catch (error) {
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
                    }
                    else {
                        await socket.data.connection("group_users").insert({
                            group_id: groupId,
                            user_id: userId,
                        });
                    }
                    const user = await socket.data
                        .connection("users")
                        .where({ id: userId })
                        .select("id", "firstname", "lastname", "online", "last_active", "profileImage")
                        .first();
                    const adderId = socket.data.user.id;
                    const group = await socket.data
                        .connection("groups")
                        .where({ id: groupId })
                        .first();
                    const groupUsers = await socket.data
                        .connection("group_users")
                        .where({ group_id: groupId, is_active: true })
                        .select("user_id");
                    const groupDetails = {
                        id: group.id,
                        name: group.name,
                        users: groupUsers.map((member) => member.user_id),
                        image: group.image,
                    };
                    const notificationMessage = {
                        id: (0, uuid_1.v4)(),
                        group_id: groupId,
                        from_user_id: null,
                        message: `${user.firstname} ${user.lastname} has rejoined the group.`,
                        system: true,
                        read_by: JSON.stringify([adderId]),
                    };
                    const personalNotificationMessage = {
                        id: (0, uuid_1.v4)(),
                        user_id: adderId,
                        group_id: groupId,
                        message: `You added ${user.firstname} ${user.lastname} to the group.`,
                        system: true,
                    };
                    await socket.data
                        .connection("personal_notifications")
                        .insert(personalNotificationMessage);
                    await socket.data
                        .connection("group_messages")
                        .insert(notificationMessage);
                    groupUsers.forEach(({ user_id }) => {
                        io.to(user_id.toString()).emit("userAddedToGroup", {
                            groupId,
                            userId,
                            user,
                        });
                        if (user_id !== adderId) {
                            io.to(user_id.toString()).emit("userRejoinedNotification", notificationMessage);
                        }
                    });
                    io.to(userId.toString()).emit("groupReenabled", groupDetails);
                    io.to(adderId.toString()).emit("userRejoinedNotification", personalNotificationMessage);
                }
            }
            catch (error) {
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
                    const removerId = socket.data.user.id;
                    if (groupUsers.length === 1 && groupUsers[0].user_id === userId) {
                        socket.emit("confirmDeleteLastUser", {
                            groupId,
                            userId,
                        });
                    }
                    else {
                        await socket.data
                            .connection("group_users")
                            .where({ group_id: groupId, user_id: userId })
                            .update({
                            is_active: false,
                            disable_date: new Date(),
                            removed_by_admin: true,
                        });
                        const user = await socket.data
                            .connection("users")
                            .where({ id: userId })
                            .select("firstname", "lastname")
                            .first();
                        const notificationMessage = {
                            id: (0, uuid_1.v4)(),
                            group_id: groupId,
                            from_user_id: null,
                            message: `${user.firstname} ${user.lastname} was removed by admin.`,
                            system: true,
                            excluded_user_id: removerId,
                        };
                        const personalNotificationMessage = {
                            id: (0, uuid_1.v4)(),
                            user_id: removerId,
                            group_id: groupId,
                            message: `You removed ${user.firstname} ${user.lastname}.`,
                            system: true,
                        };
                        await socket.data
                            .connection("personal_notifications")
                            .insert(personalNotificationMessage);
                        await socket.data
                            .connection("group_messages")
                            .insert(notificationMessage);
                        groupUsers.forEach(({ user_id }) => {
                            io.to(user_id.toString()).emit("userRemovedFromGroup", {
                                groupId,
                                userId,
                                removedByAdmin: true,
                            });
                            if (user_id !== removerId && user_id !== userId) {
                                io.to(user_id.toString()).emit("userRemovedNotification", notificationMessage);
                            }
                        });
                        io.to(userId.toString()).emit("groupDisabled", {
                            groupId,
                            removedByAdmin: true,
                        });
                        io.to(removerId.toString()).emit("userRemovedNotification", personalNotificationMessage);
                    }
                }
            }
            catch (error) {
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
                        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Group not found");
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
                    await services_1.chatService.deleteGroupImage(group.tenantID, group.image);
                    io.emit("groupDeleted", {
                        groupId,
                    });
                }
            }
            catch (error) {
                handleError(error, "Error confirming group deletion");
            }
        });
        // socket.on("deleteGroup", async ({ groupId }) => {
        //   try {
        //     if (socket.data.user && socket.data.connection) {
        //       const userId = socket.data.user.id;
        //       const groupUser = await socket.data
        //         .connection("group_users")
        //         .where({ group_id: groupId, user_id: userId })
        //         .first();
        //       if (!groupUser) {
        //         throw new ApiError(httpStatus.NOT_FOUND, "User not found in group");
        //       }
        //       if (groupUser.is_active === false) {
        //         await socket.data
        //           .connection("group_users")
        //           .where({ group_id: groupId, user_id: userId })
        //           .del();
        //         socket.emit("groupDeletedForUser", { groupId });
        //       }
        //     }
        //   } catch (error) {
        //     handleError(error, "Error deleting group");
        //   }
        // });
        socket.on("deleteGroup", async ({ groupId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const userId = socket.data.user.id;
                    const groupUser = await socket.data
                        .connection("group_users")
                        .where({ group_id: groupId, user_id: userId })
                        .first();
                    if (!groupUser) {
                        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found in group");
                    }
                    if (groupUser.is_active === false) {
                        const groupUsers = await socket.data
                            .connection("group_users")
                            .where({ group_id: groupId });
                        if (groupUsers.length === 1 && groupUsers[0].user_id === userId) {
                            await socket.data
                                .connection("group_users")
                                .where({ group_id: groupId })
                                .del();
                            await socket.data
                                .connection("group_messages")
                                .where({ group_id: groupId })
                                .del();
                            const group = await socket.data
                                .connection("groups")
                                .where({ id: groupId })
                                .first();
                            await socket.data
                                .connection("groups")
                                .where({ id: groupId })
                                .del();
                            await services_1.chatService.deleteGroupImage(group.tenantID, group.image);
                            socket.emit("groupDeleted", {
                                groupId,
                            });
                        }
                        else {
                            await socket.data
                                .connection("group_users")
                                .where({ group_id: groupId, user_id: userId })
                                .del();
                            socket.emit("groupDeleted", { groupId });
                        }
                    }
                }
            }
            catch (error) {
                handleError(error, "Error deleting group");
            }
        });
        socket.on("transferGroupOwnership", async ({ groupId, newOwnerId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const userId = socket.data.user.id;
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
                        groupUsers.forEach(({ user_id }) => {
                            io.to(user_id.toString()).emit("groupOwnershipTransferred", {
                                groupId,
                                newOwnerId,
                            });
                        });
                        await socket.data
                            .connection("group_users")
                            .where({ group_id: groupId, user_id: socket.data.user.id })
                            .update({ is_active: false, disable_date: new Date() });
                        groupUsers.forEach(({ user_id }) => {
                            io.to(user_id.toString()).emit("userLeftGroup", {
                                groupId,
                                userId: socket.data.user.id,
                            });
                        });
                        io.to(userId.toString()).emit("groupDisabled", { groupId });
                    }
                }
            }
            catch (error) {
                handleError(error, "Error transferring group ownership");
            }
        });
        socket.on("deleteGroupMessageForEveryone", async ({ messageId, groupId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const message = await socket.data
                        .connection("group_messages")
                        .where({ id: messageId, group_id: groupId })
                        .first();
                    if (message && message.from_user_id === socket.data.user.id) {
                        if (message.file_url && message.file_type && message.file_name) {
                            await services_1.chatService.deleteChatFile(socket.data.user.tenantID, message.file_url);
                            await socket.data
                                .connection("group_messages")
                                .where({ id: messageId, group_id: groupId })
                                .del();
                            const groupUsers = await socket.data
                                .connection("group_users")
                                .where({ group_id: groupId })
                                .select("user_id");
                            groupUsers.forEach(({ user_id }) => {
                                io.to(user_id.toString()).emit("groupMessageDeletedForEveryone", { messageId });
                            });
                        }
                        else {
                            await socket.data
                                .connection("group_messages")
                                .where({ id: messageId, group_id: groupId })
                                .del();
                            const groupUsers = await socket.data
                                .connection("group_users")
                                .where({ group_id: groupId })
                                .select("user_id");
                            groupUsers.forEach(({ user_id }) => {
                                io.to(user_id.toString()).emit("groupMessageDeletedForEveryone", { messageId });
                            });
                        }
                    }
                }
            }
            catch (error) {
                handleError(error, "Error deleting group message for everyone");
            }
        });
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
            }
            catch (error) {
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
                    if (message.file_url && message.file_type && message.file_name) {
                        await services_1.chatService.deleteChatFile(socket.data.user.tenantID, message.file_url);
                        await socket.data
                            .connection("messages")
                            .where({ id: messageId })
                            .del();
                        io.to(userId.toString()).emit("messageDeletedForEveryone", {
                            messageId,
                        });
                        io.to(socket.data.user.id.toString()).emit("messageDeletedForEveryone", { messageId });
                    }
                    else {
                        await socket.data
                            .connection("messages")
                            .where({ id: messageId })
                            .del();
                        io.to(userId.toString()).emit("messageDeletedForEveryone", {
                            messageId,
                        });
                        io.to(socket.data.user.id.toString()).emit("messageDeletedForEveryone", { messageId });
                    }
                }
            }
            catch (error) {
                handleError(error, "Error deleting message for everyone");
            }
        });
        socket.on("deleteSelfMessage", async ({ messageId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const { user } = socket.data;
                    // Retrieve the message to be deleted
                    const message = await socket.data
                        .connection("messages")
                        .where({
                        id: messageId,
                        fromUserId: user.id,
                        toUserId: user.id,
                    })
                        .first();
                    if (message) {
                        // If the message has a file associated with it, delete the file
                        if (message.file_url) {
                            await services_1.chatService.deleteChatFile(user.tenantID, message.file_url);
                        }
                        // Delete the message from the database
                        await socket.data
                            .connection("messages")
                            .where({ id: messageId, fromUserId: user.id })
                            .del();
                        // Notify the client that the message has been deleted
                        socket.emit("messageDeletedForSelf", { messageId });
                    }
                }
            }
            catch (error) {
                handleError(error, "Error deleting self message");
            }
        });
        socket.on("deleteMessageForMe", async ({ messageId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const existingEntries = await socket.data
                        .connection("user_messages")
                        .where({ message_id: messageId });
                    if (existingEntries.length > 0) {
                        const message = await socket.data
                            .connection("messages")
                            .where({ id: messageId })
                            .first();
                        if (message.file_url && message.file_type && message.file_name) {
                            await services_1.chatService.deleteChatFile(socket.data.user.tenantID, message.file_url);
                        }
                        await socket.data
                            .connection("messages")
                            .where({ id: messageId })
                            .del();
                        await socket.data
                            .connection("user_messages")
                            .where({ message_id: messageId })
                            .del();
                    }
                    else {
                        await socket.data.connection("user_messages").insert({
                            user_id: socket.data.user.id,
                            message_id: messageId,
                        });
                    }
                    socket.emit("messageDeletedForMe", { messageId });
                }
            }
            catch (error) {
                handleError(error, "Error deleting message for user");
            }
        });
        socket.on("leaveGroup", async ({ groupId }) => {
            try {
                if (socket.data.user && socket.data.connection) {
                    const userId = socket.data.user.id;
                    const group = await socket.data
                        .connection("groups")
                        .where({ id: groupId })
                        .first();
                    const groupUsers = await socket.data
                        .connection("group_users")
                        .where({ group_id: groupId, is_active: true })
                        .select("user_id");
                    const user = await socket.data
                        .connection("users")
                        .where({ id: userId })
                        .select("firstname", "lastname")
                        .first();
                    const notificationMessage = {
                        id: (0, uuid_1.v4)(),
                        group_id: groupId,
                        from_user_id: null,
                        message: `${user.firstname} ${user.lastname} left the group.`,
                        system: true,
                        excluded_user_id: userId,
                    };
                    const personalNotificationMessage = {
                        id: (0, uuid_1.v4)(),
                        user_id: userId,
                        group_id: groupId,
                        message: `You left the group.`,
                        system: true,
                    };
                    if (groupUsers.length === 1 && groupUsers[0].user_id === userId) {
                        await socket.data
                            .connection("group_users")
                            .where({ group_id: groupId, user_id: userId })
                            .update({
                            is_active: false,
                            disable_date: new Date(),
                        });
                        socket.emit("groupDisabled", { groupId, removedByAdmin: false });
                    }
                    else {
                        if (group.creator_id === userId) {
                            socket.emit("promptSelectNewOwner", { groupId });
                            notificationMessage.message = `${user.firstname} ${user.lastname} left the group and a new owner is being selected.`;
                            await socket.data
                                .connection("group_messages")
                                .insert(notificationMessage);
                        }
                        else {
                            await socket.data
                                .connection("group_users")
                                .where({ group_id: groupId, user_id: userId })
                                .update({
                                is_active: false,
                                disable_date: new Date(),
                                removed_by_admin: false,
                            });
                            await socket.data
                                .connection("group_messages")
                                .insert(notificationMessage);
                            io.to(userId.toString()).emit("groupDisabled", {
                                groupId,
                                removedByAdmin: false,
                            });
                        }
                        await socket.data
                            .connection("personal_notifications")
                            .insert(personalNotificationMessage);
                        groupUsers.forEach(({ user_id }) => {
                            if (user_id !== userId) {
                                io.to(user_id.toString()).emit("userRemovedFromGroup", {
                                    groupId,
                                    userId,
                                    removedByAdmin: false,
                                });
                                io.to(user_id.toString()).emit("userRemovedNotification", notificationMessage);
                            }
                        });
                        io.to(userId.toString()).emit("userRemovedFromGroup", {
                            groupId,
                            userId,
                            removedByAdmin: false,
                        });
                        io.to(userId.toString()).emit("userRemovedNotification", personalNotificationMessage);
                    }
                }
            }
            catch (error) {
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
        socket.on("startTyping", async ({ groupId, userId }) => {
            try {
                if (groupId) {
                    const groupUsers = await socket.data
                        .connection("group_users")
                        .where({ group_id: groupId, is_active: true })
                        .select("user_id");
                    groupUsers.forEach(({ user_id }) => {
                        if (user_id !== socket.data.user.id) {
                            io.to(user_id.toString()).emit("typing", {
                                user: socket.data.user,
                                groupId,
                                isGroup: true,
                            });
                        }
                    });
                }
                else {
                    socket.to(userId.toString()).emit("typing", {
                        user: socket.data.user,
                        userId,
                        isGroup: false,
                    });
                }
            }
            catch (error) {
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
                    groupUsers.forEach(({ user_id }) => {
                        if (user_id !== socket.data.user.id) {
                            io.to(user_id.toString()).emit("stopTyping", {
                                user: socket.data.user,
                                groupId,
                                isGroup: true,
                            });
                        }
                    });
                }
                else {
                    socket.to(userId).emit("stopTyping", {
                        user: socket.data.user,
                        userId,
                        isGroup: false,
                    });
                }
            }
            catch (error) {
                handleError(error, "Error handling stopTyping event");
            }
        });
    });
    return io;
};
exports.setupChatSocket = setupChatSocket;
function handleError(error, context) {
    if (error instanceof Error) {
        logger_1.default.error(`${context}: ${error.message}`);
    }
    else {
        logger_1.default.error(`${context}: An unknown error occurred`);
    }
}
