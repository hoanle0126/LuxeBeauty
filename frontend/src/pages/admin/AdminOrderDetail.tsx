import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Printer,
  Trash2,
  Edit,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminOrder, updateOrderStatus, deleteAdminOrder, type Order } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock data (for reference only) - Not used anymore
const mockOrderDetails: Record<string, unknown> = {
  DH001: {
    id: "DH001",
    date: "2024-12-20 10:30",
    status: "delivered",
    deliveredDate: "2024-12-22 15:30",
    total: 1500000,
    subtotal: 1500000,
    shippingFee: 0,
    paymentMethod: "cod",
    paymentStatus: "paid",
    customer: {
      name: "Lê Văn Xuân Hoàn",
      phone: "0912345678",
      email: "xuanhoan@example.com",
      address: "123 Nguyễn Huệ, Phường Bến Nghé",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    items: [
      {
        id: 1,
        name: "Serum Vitamin C Premium",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
        quantity: 2,
        price: 750000,
      },
    ],
    notes: "",
    adminNotes: "Khách hàng VIP, ưu tiên giao hàng",
  },
  DH002: {
    id: "DH002",
    date: "2024-12-22 09:15",
    status: "shipping",
    total: 2500000,
    subtotal: 2400000,
    shippingFee: 30000,
    paymentMethod: "bank",
    paymentStatus: "paid",
    customer: {
      name: "Trần Thị B",
      phone: "0987654321",
      email: "tranthib@example.com",
      address: "456 Lê Lợi, Phường Bến Thành",
      district: "Quận 1",
      city: "TP. Hồ Chí Minh",
    },
    items: [
      {
        id: 2,
        name: "Kem dưỡng ẩm cao cấp",
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400",
        quantity: 1,
        price: 850000,
      },
      {
        id: 3,
        name: "Son môi lì Velvet",
        image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400",
        quantity: 3,
        price: 550000,
      },
    ],
    notes: "Giao giờ hành chính",
    adminNotes: "",
  },
};

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  
  // Map status từ backend (shipped) sang frontend display (shipping) nếu cần
  const mapStatusForDisplay = (status: string): string => {
    return status === "shipped" ? "shipping" : status;
  };
  
  const mapStatusForBackend = (status: string): string => {
    return status === "shipping" ? "shipped" : status;
  };
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Fetch order from API
  useEffect(() => {
    if (!id || !isAuthenticated || !isAdmin) return;

    const loadOrder = async () => {
      setIsLoading(true);
      try {
        const fetchedOrder = await fetchAdminOrder(Number(id));
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          // Map status từ backend (shipped) sang frontend display (shipping)
          setOrderStatus(mapStatusForDisplay(fetchedOrder.status));
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: t("common.error") || "Lỗi",
          description: t("adminOrderDetail.fetchError") || "Không thể tải thông tin đơn hàng",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, isAuthenticated, isAdmin, toast, t]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6 pb-6">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("adminOrderDetail.notFound")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("adminOrderDetail.notFoundDesc")}
              </p>
              <Button onClick={() => navigate("/admin/orders")}>
                {t("adminOrderDetail.backToList")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    // Handle both "shipping" (frontend) and "shipped" (backend)
    const normalizedStatus = status === "shipped" ? "shipping" : status;
    
    switch (normalizedStatus) {
      case "pending":
        return {
          label: t("adminOrderDetail.statusPending"),
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800",
        };
      case "processing":
        return {
          label: t("orders.statusProcessing") || "Đang xử lý",
          icon: Clock,
          className: "bg-orange-100 text-orange-800",
        };
      case "shipping":
        return {
          label: t("adminOrderDetail.statusShipping"),
          icon: Truck,
          className: "bg-blue-100 text-blue-800",
        };
      case "delivered":
        return {
          label: t("adminOrderDetail.statusDelivered"),
          icon: CheckCircle2,
          className: "bg-green-100 text-green-800",
        };
      case "cancelled":
        return {
          label: t("adminOrderDetail.statusCancelled"),
          icon: XCircle,
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: t("adminOrderDetail.statusUnknown"),
          icon: Package,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "cod":
        return t("adminOrderDetail.paymentCod");
      case "bank":
        return t("adminOrderDetail.paymentBank");
      case "momo":
        return t("adminOrderDetail.paymentMomo");
      case "card":
        return t("adminOrderDetail.paymentCard");
      default:
        return t("adminOrderDetail.paymentUnknown");
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    setIsUpdating(true);
    try {
      // Map status từ frontend (shipping) sang backend (shipped)
      const backendStatus = mapStatusForBackend(orderStatus);
      
      // Tự động cập nhật payment_status dựa trên order status
      let paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | undefined = undefined;
      
      if (backendStatus === 'delivered') {
        // Khi đơn hàng đã giao → tự động thanh toán
        paymentStatus = 'paid';
      } else if (backendStatus === 'cancelled') {
        // Khi đơn hàng bị hủy → hoàn tiền nếu đã thanh toán, failed nếu chưa thanh toán
        paymentStatus = order.paymentStatus === 'paid' ? 'refunded' : 'failed';
      }
      // Các trạng thái khác (pending, processing, shipped) giữ nguyên payment_status hiện tại
      
      const updatedOrder = await updateOrderStatus(order.id, {
        status: backendStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        ...(paymentStatus && { payment_status: paymentStatus }),
      });

      setOrder(updatedOrder);
      // Map status từ backend (shipped) sang frontend display (shipping)
      setOrderStatus(mapStatusForDisplay(updatedOrder.status));
      
      toast({
        title: t("adminOrderDetail.updateStatus") || "Cập nhật thành công",
        description: t("adminOrderDetail.updateStatusDesc", { status: getStatusConfig(orderStatus).label }) || `Đã cập nhật trạng thái thành ${getStatusConfig(orderStatus).label}`,
      });
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("adminOrderDetail.updateError") || "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = () => {
    // TODO: Implement admin notes feature if needed
    setIsEditingNotes(false);
    toast({
      title: t("adminOrderDetail.saveNotes"),
      description: t("adminOrderDetail.saveNotesDesc"),
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: t("adminOrderDetail.printInvoice"),
      description: t("adminOrderDetail.printInvoiceDesc"),
    });
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!order) return;

    setIsDeleting(true);
    try {
      await deleteAdminOrder(order.id);
      
      toast({
        title: t("adminOrderDetail.deleteOrder") || "Đã xóa đơn hàng",
        description: t("adminOrderDetail.deleteOrderDesc", { id: order.orderNumber }) || `Đã xóa đơn hàng ${order.orderNumber}`,
      });
      
      navigate("/admin/orders");
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("adminOrderDetail.deleteError") || "Không thể xóa đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const statusConfig = getStatusConfig(orderStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/orders")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("adminOrderDetail.orderTitle", { id: order.orderNumber })}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("adminOrderDetail.orderDate", { date: formatDate(order.createdAt || "") })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t("adminOrderDetail.print")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("common.delete")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>{t("adminOrderDetail.updateStatusTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>{t("adminOrderDetail.orderStatus")}</Label>
                    <Select value={orderStatus} onValueChange={setOrderStatus}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t("adminOrderDetail.statusPending")}
                          </div>
                        </SelectItem>
                        <SelectItem value="processing">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {t("orders.statusProcessing") || "Đang xử lý"}
                          </div>
                        </SelectItem>
                        <SelectItem value="shipping">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            {t("adminOrderDetail.statusShippingFull")}
                          </div>
                        </SelectItem>
                        <SelectItem value="delivered">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {t("adminOrderDetail.statusDeliveredFull")}
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            {t("adminOrderDetail.statusCancelled")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="mt-8"
                    onClick={handleUpdateStatus}
                    disabled={mapStatusForBackend(orderStatus) === order.status || isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t("common.loading")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {t("common.update")}
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className="h-5 w-5" />
                    <span className="font-medium">{t("adminOrderDetail.currentStatus")}:</span>
                    <Badge className={statusConfig.className}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {order.status === "delivered" && order.updatedAt && (
                    <p className="text-sm text-muted-foreground">
                      {t("adminOrderDetail.deliveredSuccess")}: {formatDate(order.updatedAt)}
                    </p>
                  )}
                  {order.status === "shipped" && order.updatedAt && (
                    <p className="text-sm text-muted-foreground">
                      {t("adminOrderDetail.shippedDate") || "Đã giao hàng"}: {formatDate(order.updatedAt)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t("adminOrderDetail.customerInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("adminOrderDetail.customerName")}</p>
                      <p className="font-medium">{order.shippingName || order.user?.name || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t("adminOrderDetail.phone")}</p>
                      <p className="font-medium">{order.shippingPhone || order.user?.phone || ""}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminOrderDetail.email")}</p>
                    <p className="font-medium">{order.shippingEmail || order.user?.email || ""}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("adminOrderDetail.shippingAddress")}</p>
                    <p className="font-medium">
                      {order.shippingAddress || ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {t("adminOrderDetail.products")} ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-border rounded-lg">
                      <img
                        src={item.productImage || "https://via.placeholder.com/80"}
                        alt={item.productName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">
                          {item.productName}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("adminOrderDetail.quantity")}: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1">
                          {formatPrice(item.productPrice)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("adminOrderDetail.notes")}</CardTitle>
                  {!isEditingNotes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingNotes(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("common.edit")}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.notes && (
                  <div>
                    <Label>{t("adminOrderDetail.customerNotes")}</Label>
                    <p className="text-sm text-muted-foreground mt-2 p-3 bg-accent rounded-md">
                      {order.notes}
                    </p>
                  </div>
                )}

                <div>
                  <Label>{t("adminOrderDetail.adminNotes")}</Label>
                  {isEditingNotes ? (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        placeholder={t("adminOrderDetail.adminNotesPlaceholder")}
                        className="min-h-[100px]"
                        disabled
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveNotes} disabled>
                          <Save className="h-4 w-4 mr-2" />
                          {t("common.save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingNotes(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2 p-3 bg-accent rounded-md">
                      {t("adminOrderDetail.noAdminNotes")}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("adminOrderDetail.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("adminOrderDetail.orderDateLabel")}:</span>
                  </div>
                  <p className="font-medium pl-6">{formatDate(order.createdAt || "")}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("adminOrderDetail.paymentLabel")}:</span>
                  </div>
                  <p className="text-sm font-medium pl-6">
                    {getPaymentMethodName(order.paymentMethod || "")}
                  </p>
                  {order.paymentStatus === "paid" && (
                    <Badge className="ml-6 bg-green-100 text-green-800">
                      {t("adminOrderDetail.paid")}
                    </Badge>
                  )}
                  {order.paymentStatus === "pending" && (
                    <Badge className="ml-6 bg-yellow-100 text-yellow-800">
                      {t("orderDetail.unpaid")}
                    </Badge>
                  )}
                  {order.paymentStatus === "refunded" && (
                    <Badge className="ml-6 bg-blue-100 text-blue-800">
                      {t("adminOrderDetail.refunded")}
                    </Badge>
                  )}
                  {order.paymentStatus === "failed" && (
                    <Badge className="ml-6 bg-red-100 text-red-800">
                      {t("adminOrderDetail.failed")}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("adminOrderDetail.subtotal")}</span>
                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("adminOrderDetail.shippingFee")}</span>
                    <span className="font-medium">
                      {order.shippingFee === 0
                        ? t("adminOrderDetail.freeShipping")
                        : formatPrice(order.shippingFee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">{t("adminOrderDetail.total")}</span>
                    <span className="font-bold text-lg text-primary">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Order Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminOrderDetail.deleteOrder") || "Xóa đơn hàng"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("adminOrderDetail.confirmDelete", { id: order?.orderNumber }) || `Bạn có chắc chắn muốn xóa đơn hàng ${order?.orderNumber}?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("common.delete")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;

