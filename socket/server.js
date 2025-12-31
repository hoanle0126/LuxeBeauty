import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import axios from "axios";
import express from "express";

dotenv.config();

const PORT = process.env.SOCKET_PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Create Express app for HTTP endpoints
const app = express();
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Store connected users
const connectedUsers = new Map();

// Middleware to verify authentication token
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Authentication token required"));
  }

  try {
    // Verify token with Laravel backend
    const response = await axios.get(`${BACKEND_URL}/api/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.data && response.data.id) {
      socket.userId = response.data.id;
      socket.user = response.data;
      return next();
    }

    return next(new Error("Invalid token"));
  } catch (error) {
    console.error("Token verification error:", error.message);
    return next(new Error("Authentication failed"));
  }
});

// Handle connection
io.on("connection", (socket) => {
  const userId = socket.userId;
  const user = socket.user;

  console.log(`User connected: ${userId} (${user?.name || user?.email})`);

  // Store user connection
  connectedUsers.set(userId, {
    socketId: socket.id,
    user: user,
    connectedAt: new Date(),
  });

  // Join user to their personal room
  socket.join(`user:${userId}`);

  // Join admin users to admin room
  if (user?.roles?.some((role) => role.name === "admin")) {
    socket.join("admin");
    console.log(`Admin user ${userId} joined admin room`);
  }

  // Emit connection success
  socket.emit("connected", {
    message: "Connected to server",
    userId: userId,
    timestamp: new Date().toISOString(),
  });

  // Handle order status updates (for admins)
  socket.on("order:status:update", async (data) => {
    try {
      const { orderId, status, paymentStatus } = data;

      if (!orderId || !status) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      // Verify user is admin
      if (!user?.roles?.some((role) => role.name === "admin")) {
        socket.emit("error", { message: "Unauthorized" });
        return;
      }

      // Broadcast to all admins
      io.to("admin").emit("order:status:updated", {
        orderId,
        status,
        paymentStatus,
        updatedBy: userId,
        timestamp: new Date().toISOString(),
      });

      // Notify the order owner
      // Assuming we can get order owner from backend
      // For now, broadcast to all users (you can optimize this later)
      io.emit("order:status:changed", {
        orderId,
        status,
        timestamp: new Date().toISOString(),
      });

      console.log(`Order ${orderId} status updated to ${status} by user ${userId}`);
    } catch (error) {
      console.error("Error handling order status update:", error);
      socket.emit("error", { message: "Failed to update order status" });
    }
  });

  // Handle new order notifications (for admins)
  socket.on("order:new", (data) => {
    try {
      const { orderId, orderNumber, customerName, total } = data;

      // Broadcast to all admins
      io.to("admin").emit("order:created", {
        orderId,
        orderNumber,
        customerName,
        total,
        timestamp: new Date().toISOString(),
      });

      console.log(`New order ${orderNumber} created`);
    } catch (error) {
      console.error("Error handling new order:", error);
      socket.emit("error", { message: "Failed to notify new order" });
    }
  });

  // Handle user notifications
  socket.on("notification:send", (data) => {
    try {
      const { userId: targetUserId, message, type } = data;

      if (!targetUserId || !message) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      // Send notification to specific user
      io.to(`user:${targetUserId}`).emit("notification:received", {
        message,
        type: type || "info",
        timestamp: new Date().toISOString(),
      });

      console.log(`Notification sent to user ${targetUserId}`);
    } catch (error) {
      console.error("Error sending notification:", error);
      socket.emit("error", { message: "Failed to send notification" });
    }
  });

  // Handle typing indicators (for future chat feature)
  socket.on("typing:start", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("typing:started", {
      userId,
      userName: user?.name || user?.email,
    });
  });

  socket.on("typing:stop", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("typing:stopped", { userId });
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${userId} (${reason})`);
    connectedUsers.delete(userId);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for user ${userId}:`, error);
  });
});

// HTTP endpoint để nhận notification từ backend
app.post("/api/notify", (req, res) => {
  try {
    const { room, event, data } = req.body;

    if (!event || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: event, data",
      });
    }

    // Nếu room là 'all', broadcast to all connected users
    // Nếu không, emit đến room cụ thể
    if (room === "all") {
      io.emit(event, data);
      console.log(`Notification broadcasted to all users with event "${event}"`);
    } else if (room) {
      io.to(room).emit(event, data);
      console.log(`Notification emitted to room "${room}" with event "${event}"`);
    } else {
      // Nếu không có room, broadcast to all
      io.emit(event, data);
      console.log(`Notification broadcasted to all users with event "${event}"`);
    }

    res.json({
      success: true,
      message: "Notification sent",
    });
  } catch (error) {
    console.error("Error handling notification request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${FRONTEND_URL}`);
  console.log(`🔗 Backend URL: ${BACKEND_URL}`);
  console.log(`👥 Connected users: ${connectedUsers.size}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  httpServer.close(() => {
    console.log("Socket server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  httpServer.close(() => {
    console.log("Socket server closed");
    process.exit(0);
  });
});

