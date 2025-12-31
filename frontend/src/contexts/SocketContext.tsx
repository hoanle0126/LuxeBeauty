import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const isConnectingRef = useRef(false);
  const tokenRef = useRef<string | null>(null);

  const connect = () => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, skipping socket connection");
      return;
    }

    // Nếu đang trong quá trình connect, bỏ qua
    if (isConnectingRef.current) {
      return;
    }

    // Nếu đã có socket và đang connected, không tạo mới
    if (socket && socket.connected) {
      console.log("Socket already connected");
      return;
    }

    // Nếu token không thay đổi và đã có socket, không tạo mới
    if (token === tokenRef.current && socket) {
      return;
    }

    isConnectingRef.current = true;
    tokenRef.current = token;

    // Disconnect socket cũ nếu có
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    // Tạo socket connection mới
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Handle connection events
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      isConnectingRef.current = false;
    });

    newSocket.on("connected", (data) => {
      console.log("Socket authenticated:", data);
      setIsConnected(true);
      isConnectingRef.current = false;
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
      isConnectingRef.current = false;
      
      // Chỉ hiển thị toast nếu lỗi không phải do authentication
      if (error.message !== "Authentication token required" && 
          error.message !== "Authentication failed" &&
          error.message !== "Invalid token") {
        toast({
          title: t("common.error") || "Lỗi",
          description: t("socket.connectionError") || "Không thể kết nối đến server",
          variant: "destructive",
        });
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: error.message || t("socket.error") || "Có lỗi xảy ra",
        variant: "destructive",
      });
    });

    // Handle order status updates
    newSocket.on("order:status:changed", (data) => {
      console.log("Order status changed:", data);
      toast({
        title: t("socket.orderStatusChanged") || "Cập nhật đơn hàng",
        description: t("socket.orderStatusChangedDesc", { 
          orderId: data.orderId,
          status: data.status 
        }) || `Đơn hàng #${data.orderId} đã được cập nhật thành ${data.status}`,
      });
    });

    // Handle order created (for admins)
    newSocket.on("order:created", (data) => {
      console.log("New order created:", data);
      toast({
        title: t("socket.newOrder") || "Đơn hàng mới",
        description: t("socket.newOrderDesc", {
          orderNumber: data.orderNumber,
          customerName: data.customerName,
        }) || `Đơn hàng mới ${data.orderNumber} từ ${data.customerName}`,
      });
    });

    // Handle notifications
    newSocket.on("notification:received", (data) => {
      console.log("Notification received:", data);
      toast({
        title: t("socket.notification") || "Thông báo",
        description: data.message,
        variant: data.type === "error" ? "destructive" : "default",
      });
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      tokenRef.current = null;
      isConnectingRef.current = false;
    }
  };

  // Auto connect when token is available (chỉ chạy một lần khi mount)
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
    };
  }, []); // Chỉ chạy một lần khi mount

  // Monitor token changes (không gây re-render)
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      const currentSocket = socket;
      
      // Token mới xuất hiện
      if (token && token !== tokenRef.current) {
        if (!currentSocket || !currentSocket.connected) {
          connect();
        }
      }
      
      // Token bị xóa
      if (!token && currentSocket && currentSocket.connected) {
        disconnect();
      }
    };

    // Check periodically (mỗi 2 giây)
    const interval = setInterval(checkToken, 2000);

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        checkToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [socket]); // Chỉ re-run khi socket thay đổi (sau khi connect/disconnect)

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

