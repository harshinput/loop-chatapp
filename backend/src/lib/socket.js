import e from "express";
import http from "http";
import { Server } from "socket.io";

const app = e();
const server = http.createServer(app);
const allowedOrigin = process.env.VITE_FRONTEND_URL || "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: [allowedOrigin],
  },
});

function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId];
}

// Map to store user IDs and their corresponding sockets {userId: socketId}
const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  //   Emit the updated list of online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //   broadcast to all clients when a user disconnects
  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };
