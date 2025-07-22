const socket = require("socket.io");
const crypto = require("crypto");
const { Chat}  = require("../models/chat");
require('dotenv').config();
const Group = require("../models/group");
const User = require("../models/user");



const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
     credentials: true 
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    }); 

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
            timestamp: new Date(),
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName, text , timestamp: new Date(),});
        } catch (err) {
          res.status(500).send("Error sending message: " + err.message);
        }
      }
    );
    socket.on("joinGroup", ({ groupId }) => {
      socket.join(groupId);
    });

    socket.on("sendGroupMessage", async ({ groupId, userId, text }) => {
      try {
        const group = await Group.findById(groupId);
        group.messages.push({ senderId: userId, text });
        await group.save();
        const sender = await User.findById(userId);
        io.to(groupId).emit("groupMessageReceived", {
          userId,
          text,
          firstName: sender?.firstName,
          lastName: sender?.lastName,
          senderId: userId,
          timestamp: new Date(),
        });
      } catch (err) {
        res.status(500).send("Error sending group message: " + err.message);
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
