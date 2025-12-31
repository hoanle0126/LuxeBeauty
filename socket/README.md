# 🔌 Socket.IO Server

Socket.IO server cho Blooming Ecommerce, cung cấp real-time communication giữa frontend và backend.

## 📋 Tính năng

- ✅ **Authentication**: Xác thực người dùng qua Laravel Sanctum token
- ✅ **Real-time Order Updates**: Cập nhật trạng thái đơn hàng real-time
- ✅ **Admin Notifications**: Thông báo cho admin khi có đơn hàng mới
- ✅ **User Notifications**: Gửi thông báo đến người dùng cụ thể
- ✅ **Room Management**: Quản lý rooms cho users và admins
- ✅ **Typing Indicators**: Hỗ trợ typing indicators (cho chat feature tương lai)

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd socket
npm install
```

### 2. Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
SOCKET_PORT=3001
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
NODE_ENV=development
```

### 3. Chạy server

**Development mode (với auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server sẽ chạy trên port `3001` (hoặc port được cấu hình trong `.env`).

## 📡 Events

### Client → Server

#### `order:status:update`
Cập nhật trạng thái đơn hàng (chỉ admin)

```javascript
socket.emit("order:status:update", {
  orderId: 123,
  status: "delivered",
  paymentStatus: "paid"
});
```

#### `order:new`
Thông báo đơn hàng mới (chỉ admin)

```javascript
socket.emit("order:new", {
  orderId: 123,
  orderNumber: "DH001",
  customerName: "Nguyễn Văn A",
  total: 1500000
});
```

#### `notification:send`
Gửi thông báo đến user cụ thể

```javascript
socket.emit("notification:send", {
  userId: 456,
  message: "Đơn hàng của bạn đã được xác nhận",
  type: "success"
});
```

#### `typing:start` / `typing:stop`
Typing indicators (cho chat feature)

```javascript
socket.emit("typing:start", { roomId: "chat:123" });
socket.emit("typing:stop", { roomId: "chat:123" });
```

### Server → Client

#### `connected`
Xác nhận kết nối thành công

```javascript
socket.on("connected", (data) => {
  console.log(data.message); // "Connected to server"
  console.log(data.userId);
});
```

#### `order:status:updated`
Thông báo cập nhật trạng thái đơn hàng (cho admins)

```javascript
socket.on("order:status:updated", (data) => {
  console.log(`Order ${data.orderId} status: ${data.status}`);
});
```

#### `order:status:changed`
Thông báo thay đổi trạng thái đơn hàng (cho users)

```javascript
socket.on("order:status:changed", (data) => {
  console.log(`Your order ${data.orderId} status: ${data.status}`);
});
```

#### `order:created`
Thông báo đơn hàng mới (cho admins)

```javascript
socket.on("order:created", (data) => {
  console.log(`New order: ${data.orderNumber}`);
});
```

#### `notification:received`
Nhận thông báo

```javascript
socket.on("notification:received", (data) => {
  console.log(data.message);
  console.log(data.type); // "info", "success", "warning", "error"
});
```

#### `error`
Lỗi từ server

```javascript
socket.on("error", (data) => {
  console.error(data.message);
});
```

## 🔐 Authentication

Socket server sử dụng Laravel Sanctum token để xác thực. Client phải gửi token khi kết nối:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: {
    token: "your-sanctum-token-here"
  }
});
```

Server sẽ verify token với Laravel backend API endpoint: `GET /api/user`

## 🏗️ Cấu trúc Rooms

- `user:{userId}`: Room riêng cho mỗi user
- `admin`: Room chung cho tất cả admin users

## 🔧 Tích hợp với Frontend

### 1. Cài đặt Socket.IO client

```bash
cd frontend
npm install socket.io-client
```

### 2. Tạo Socket Context

```typescript
// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io("http://localhost:3001", {
      auth: { token },
    });

    newSocket.on("connected", () => {
      console.log("Socket connected");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
```

### 3. Sử dụng trong component

```typescript
import { useSocket } from "@/contexts/SocketContext";
import { useEffect } from "react";

const MyComponent = () => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("order:status:changed", (data) => {
      console.log("Order status changed:", data);
      // Update UI
    });

    return () => {
      socket.off("order:status:changed");
    };
  }, [socket]);

  return <div>...</div>;
};
```

## 🐛 Troubleshooting

### Lỗi "Authentication token required"
- Đảm bảo client gửi token trong `auth.token` khi kết nối
- Kiểm tra token có hợp lệ không

### Lỗi "CORS"
- Kiểm tra `FRONTEND_URL` trong `.env` có đúng không
- Đảm bảo frontend URL khớp với URL đang chạy

### Không nhận được events
- Kiểm tra socket đã kết nối chưa (listen event `connected`)
- Kiểm tra user đã join đúng room chưa
- Kiểm tra event name có đúng không

## 📝 Notes

- Server tự động verify token với Laravel backend mỗi khi có connection mới
- Admin users tự động join `admin` room
- Mỗi user tự động join room riêng `user:{userId}`
- Server hỗ trợ graceful shutdown với SIGTERM và SIGINT

## 🔮 Tính năng tương lai

- [ ] Chat support giữa admin và customer
- [ ] Real-time inventory updates
- [ ] Live order tracking
- [ ] Push notifications
- [ ] Analytics và monitoring

