import { useState, useEffect } from "react";
import { Bell, Package, ShoppingCart, User, CheckCircle2, X, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/contexts/SocketContext";
import {
  fetchNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
} from "@/lib/api";

// Helper function để format time relative
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} tháng trước`;
};

// Map notification type với icon và màu sắc
const getNotificationConfig = (type: string) => {
  switch (type) {
    case "user_registered":
      return {
        icon: User,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    case "order_created":
      return {
        icon: ShoppingCart,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    case "support_message":
      return {
        icon: MessageSquare,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      };
    case "product_review":
      return {
        icon: Package,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      };
    default:
      return {
        icon: Bell,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
  }
};

const NotificationDrawer = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications từ backend
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetchNotifications({ per_page: 50 });
      setNotifications(response.data);
      
      // Fetch unread count
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("notifications.loadFailed") || "Không thể tải thông báo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications khi component mount hoặc drawer mở
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  // Load unread count khi component mount
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationsCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Error loading unread count:", error);
      }
    };

    loadUnreadCount();
    // Refresh unread count mỗi 30 giây
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lắng nghe socket event "admin:notification"
  useEffect(() => {
    if (!socket) return;

    const handleAdminNotification = (data: Notification) => {
      // Thêm notification mới vào đầu danh sách
      setNotifications((prev) => [data, ...prev]);
      // Tăng unread count
      setUnreadCount((prev) => prev + 1);
      
      // Hiển thị toast
      toast({
        title: data.title,
        description: data.message,
      });
    };

    socket.on("admin:notification", handleAdminNotification);

    return () => {
      socket.off("admin:notification", handleAdminNotification);
    };
  }, [socket, toast]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, readAt: new Date().toISOString() } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("notifications.markReadFailed") || "Không thể đánh dấu đã đọc",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast({
        title: t("notifications.markAllReadSuccess") || "Đã đánh dấu tất cả đã đọc",
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("notifications.markAllReadFailed") || "Không thể đánh dấu tất cả đã đọc",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      // Giảm unread count nếu notification chưa đọc
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.readAt) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("notifications.deleteFailed") || "Không thể xóa thông báo",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    try {
      // Xóa từng notification
      await Promise.all(notifications.map((notif) => deleteNotification(notif.id)));
      setNotifications([]);
      setUnreadCount(0);
      toast({
        title: t("notifications.clearAllSuccess") || "Đã xóa tất cả thông báo",
      });
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("notifications.clearAllFailed") || "Không thể xóa tất cả thông báo",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white text-xs">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications.title") || "Thông báo"}
              {unreadCount > 0 && (
                <Badge className="bg-primary text-white">
                  {unreadCount}
                </Badge>
              )}
            </SheetTitle>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    {t("notifications.markAllRead") || "Đọc tất cả"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  {t("notifications.clearAll") || "Xóa tất cả"}
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("notifications.empty") || "Không có thông báo"}</p>
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-2">
              {notifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                const Icon = config.icon;
                const isRead = !!notification.readAt;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative rounded-lg border border-border p-4 transition-colors cursor-pointer hover:bg-accent",
                      !isRead && "bg-accent/50"
                    )}
                    onClick={() => !isRead && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                          config.bgColor
                        )}
                      >
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "font-medium text-sm",
                              !isRead ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {!isRead && (
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationDrawer;
