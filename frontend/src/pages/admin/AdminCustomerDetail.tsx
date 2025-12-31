import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchCustomer, updateCustomer, clearCustomersError, Customer } from "@/stores/customers/action";
import { AppDispatch, RootState } from "@/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Crown,
  Shield,
  ShieldOff,
  Loader2,
  Package,
  MapPin,
  Edit,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Order interface
interface Order {
  id: number;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  itemsCount: number;
}

// Mock orders data (tạm thời vì chưa có Order API)
const mockOrders: { [key: number]: Order[] } = {
  1: [
    {
      id: 1001,
      date: "2024-12-15",
      status: "delivered",
      total: 850000,
      itemsCount: 3,
    },
    {
      id: 1002,
      date: "2024-12-01",
      status: "delivered",
      total: 1200000,
      itemsCount: 4,
    },
    {
      id: 1003,
      date: "2024-11-20",
      status: "delivered",
      total: 650000,
      itemsCount: 2,
    },
    {
      id: 1004,
      date: "2024-11-10",
      status: "delivered",
      total: 950000,
      itemsCount: 3,
    },
    {
      id: 1005,
      date: "2024-11-01",
      status: "cancelled",
      total: 450000,
      itemsCount: 1,
    },
  ],
  2: [
    {
      id: 2001,
      date: "2024-12-10",
      status: "shipped",
      total: 750000,
      itemsCount: 2,
    },
    {
      id: 2002,
      date: "2024-11-25",
      status: "delivered",
      total: 900000,
      itemsCount: 3,
    },
  ],
  3: [
    {
      id: 3001,
      date: "2024-11-20",
      status: "delivered",
      total: 400000,
      itemsCount: 1,
    },
  ],
};

const AdminCustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get customer from Redux store
  const { currentCustomer, loading: isLoadingCustomer, error } = useSelector(
    (state: RootState) => state.customers
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Load customer data
  useEffect(() => {
    if (id && isAuthenticated && isAdmin) {
      dispatch(fetchCustomer(Number(id)));
    }
  }, [id, dispatch, isAuthenticated, isAdmin]);

  // Load orders (tạm thời dùng mock data)
  useEffect(() => {
    if (currentCustomer) {
      setOrders(mockOrders[currentCustomer.id] || []);
    }
  }, [currentCustomer]);

  // Handle error
  useEffect(() => {
    if (error) {
      let errorMessage = "Có lỗi xảy ra";
      if (typeof error === "object" && error !== null) {
        const errorMessages = Object.values(error).flat() as string[];
        errorMessage = errorMessages[0] || t("common.error") || "Có lỗi xảy ra";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      if (errorMessage) {
        toast({
          title: t("common.error") || "Lỗi",
          description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
          variant: "destructive",
        });
        dispatch(clearCustomersError());
      }
    }
  }, [error, toast, t, dispatch]);

  // Redirect if customer not found
  useEffect(() => {
    if (!isLoadingCustomer && !currentCustomer && id) {
      toast({
        title: t("customerDetail.notFound"),
        description: t("customerDetail.notFoundDesc"),
        variant: "destructive",
      });
      navigate("/admin/customers");
    }
  }, [isLoadingCustomer, currentCustomer, id, navigate, toast, t]);

  // Handle block toggle
  const handleBlockToggle = async () => {
    if (!currentCustomer) return;

    const newStatus = currentCustomer.status === "active" ? "blocked" : "active";
    try {
      await dispatch(updateCustomer(currentCustomer.id, {
        name: currentCustomer.name,
        email: currentCustomer.email,
        phone: currentCustomer.phone,
        address: currentCustomer.address,
        avatar: currentCustomer.avatar,
        status: newStatus,
      }));

      toast({
        title: newStatus === "blocked" ? t("customerDetail.accountBlocked") : t("customerDetail.accountUnblocked"),
        description: t("customers.accountBlockedDesc", {
          name: currentCustomer.name,
          action: newStatus === "blocked" ? t("customers.blocked") : t("customers.unblocked")
        }),
      });
    } catch (error) {
      // Error đã được xử lý trong useEffect
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get status badge
  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      pending: { label: t("customerDetail.orderStatusPending"), variant: "secondary" as const },
      processing: { label: t("customerDetail.orderStatusProcessing"), variant: "default" as const },
      shipped: { label: t("customerDetail.orderStatusShipped"), variant: "default" as const },
      delivered: { label: t("customerDetail.orderStatusDelivered"), variant: "default" as const },
      cancelled: { label: t("customerDetail.orderStatusCancelled"), variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Loading state
  if (authLoading || isLoadingCustomer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("customerDetail.loading")}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin || !currentCustomer) {
    return null;
  }

  const averageOrderValue =
    currentCustomer.totalOrders > 0 ? currentCustomer.totalSpent / currentCustomer.totalOrders : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/customers")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("customerDetail.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("customerDetail.description")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </Button>
            <Button
              variant={currentCustomer.status === "active" ? "destructive" : "default"}
              onClick={handleBlockToggle}
            >
              {currentCustomer.status === "active" ? (
                <>
                  <ShieldOff className="h-4 w-4 mr-2" />
                  {t("customerDetail.blockAccount")}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t("customerDetail.unblockAccount")}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t("customerDetail.customerInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={currentCustomer.avatar} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(currentCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{currentCustomer.name}</h3>
                      {currentCustomer.isVip && (
                        <Crown className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    {currentCustomer.status === "active" ? (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">
                        {t("customerDetail.statusActive")}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {t("customerDetail.statusBlocked")}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t("customerDetail.email")}</p>
                      <p className="font-medium">{currentCustomer.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{t("customerDetail.phone")}</p>
                      <p className="font-medium">{currentCustomer.phone}</p>
                    </div>
                  </div>

                  {currentCustomer.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{t("customerDetail.address")}</p>
                        <p className="font-medium">{currentCustomer.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t("customerDetail.joinedDate")}
                      </p>
                      <p className="font-medium">{formatDate(currentCustomer.joinedDate)}</p>
                    </div>
                  </div>

                  {currentCustomer.lastOrderDate && (
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {t("customerDetail.lastOrder")}
                        </p>
                        <p className="font-medium">
                          {formatDate(currentCustomer.lastOrderDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{t("customerDetail.statistics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t("customerDetail.totalOrders")}</p>
                    <p className="text-xl font-bold">{currentCustomer.totalOrders}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t("customerDetail.totalSpent")}</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(currentCustomer.totalSpent)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {t("customerDetail.avgOrderValue")}
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(averageOrderValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("customerDetail.orderHistory")} ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t("customerDetail.noOrders")}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("customerDetail.orderId")}</TableHead>
                          <TableHead>{t("customerDetail.orderDate")}</TableHead>
                          <TableHead>{t("customerDetail.itemsCount")}</TableHead>
                          <TableHead>{t("common.status")}</TableHead>
                          <TableHead className="text-right">{t("customerDetail.orderTotal")}</TableHead>
                          <TableHead className="text-right">{t("common.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              #{order.id}
                            </TableCell>
                            <TableCell>{formatDate(order.date)}</TableCell>
                            <TableCell>{order.itemsCount} {t("customerDetail.products")}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(order.total)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <Link to={`/admin/orders/${order.id}`}>
                                  {t("common.view")}
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Customer Dialog */}
        <EditCustomerDialog
          customer={currentCustomer}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            if (id) {
              dispatch(fetchCustomer(Number(id)));
            }
          }}
        />
      </div>
    </AdminLayout>
  );
};

// Edit Customer Dialog Component
interface EditCustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditCustomerDialog = ({ customer, open, onOpenChange, onSuccess }: EditCustomerDialogProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { loading } = useSelector((state: RootState) => state.customers);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    status: "active" as "active" | "blocked",
    password: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || "",
        address: customer.address || "",
        avatar: customer.avatar || "",
        status: customer.status,
        password: "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    try {
      await dispatch(updateCustomer(customer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar,
        status: formData.status,
        password: formData.password || undefined,
      }));

      toast({
        title: t("customers.updatedCustomer") || "Cập nhật thành công",
        description: t("customers.updatedCustomerDesc", { name: formData.name }) || `Đã cập nhật khách hàng "${formData.name}"`,
      });

      onSuccess();
    } catch (error) {
      // Error đã được xử lý trong useEffect của component cha
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("customers.editCustomer") || "Chỉnh sửa khách hàng"}</DialogTitle>
          <DialogDescription>
            {t("customers.editCustomerDesc") || "Cập nhật thông tin khách hàng"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("customers.customerName")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("customers.email") || "Email"}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("customers.phone") || "Số điện thoại"}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("customers.address") || "Địa chỉ"}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">{t("customers.avatar") || "Avatar URL"}</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t("common.status")}</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "blocked" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("customers.statusActive")}</SelectItem>
                <SelectItem value="blocked">{t("customers.statusBlocked")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password") || "Mật khẩu mới (để trống nếu không đổi)"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.update")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCustomerDetail;

