import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Loader2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import PageTitle from "@/components/PageTitle";
import {
  fetchDashboardStats,
  fetchRevenueChart,
  fetchOrdersChart,
  fetchTopProducts,
  fetchRecentOrders,
  clearDashboardError,
} from "@/stores/dashboard/action";
import { AppDispatch, RootState } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/contexts/SocketContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get dashboard data from Redux store
  const {
    stats,
    revenueChart,
    ordersChart,
    topProducts,
    recentOrders,
    loading: isLoadingDashboard,
    error,
  } = useSelector((state: RootState) => state.dashboard);

  // Get socket connection
  const { socket } = useSocket();

  // Function to refresh all dashboard data
  const refreshDashboardData = useCallback(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchDashboardStats());
      dispatch(fetchRevenueChart());
      dispatch(fetchOrdersChart());
      dispatch(fetchTopProducts());
      dispatch(fetchRecentOrders());
    }
  }, [dispatch, isAuthenticated, isAdmin]);

  // Fetch dashboard data on mount
  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket || !isAuthenticated || !isAdmin) return;

    // Listen for new orders - refresh stats, orders chart, and recent orders
    const handleNewOrder = (data: any) => {
      console.log("New order received via socket:", data);
      dispatch(fetchDashboardStats());
      dispatch(fetchOrdersChart());
      dispatch(fetchRecentOrders());
      dispatch(fetchTopProducts()); // Top products might change
    };

    // Listen for order status updates - refresh stats and recent orders
    const handleOrderStatusUpdate = (data: any) => {
      console.log("Order status updated via socket:", data);
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentOrders());
    };

    // Listen for dashboard refresh event (from backend)
    const handleDashboardRefresh = () => {
      console.log("Dashboard refresh requested via socket");
      refreshDashboardData();
    };

    // Register event listeners
    socket.on("order:created", handleNewOrder);
    socket.on("order:status:updated", handleOrderStatusUpdate);
    socket.on("dashboard:refresh", handleDashboardRefresh);

    // Cleanup: remove listeners on unmount or when socket changes
    return () => {
      socket.off("order:created", handleNewOrder);
      socket.off("order:status:updated", handleOrderStatusUpdate);
      socket.off("dashboard:refresh", handleDashboardRefresh);
    };
  }, [socket, isAuthenticated, isAdmin, dispatch, refreshDashboardData]);

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
        dispatch(clearDashboardError());
      }
    }
  }, [error, toast, t, dispatch]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Format month labels from backend (YYYY-MM) to display format
  const formatMonthLabel = useMemo(() => (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const monthIndex = parseInt(month) - 1;
    const monthNames = [
      t("dashboard.month1"),
      t("dashboard.month2"),
      t("dashboard.month3"),
      t("dashboard.month4"),
      t("dashboard.month5"),
      t("dashboard.month6"),
      t("dashboard.month7"),
      t("dashboard.month8"),
      t("dashboard.month9"),
      t("dashboard.month10"),
      t("dashboard.month11"),
      t("dashboard.month12"),
    ];
    return monthNames[monthIndex] || monthStr;
  }, [t]);

  const formatMonthShortLabel = useMemo(() => (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const monthIndex = parseInt(month) - 1;
    const monthShortNames = [
      t("dashboard.monthShort1"),
      t("dashboard.monthShort2"),
      t("dashboard.monthShort3"),
      t("dashboard.monthShort4"),
      t("dashboard.monthShort5"),
      t("dashboard.monthShort6"),
      t("dashboard.monthShort7"),
      t("dashboard.monthShort8"),
      t("dashboard.monthShort9"),
      t("dashboard.monthShort10"),
      t("dashboard.monthShort11"),
      t("dashboard.monthShort12"),
    ];
    return monthShortNames[monthIndex] || monthStr;
  }, [t]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format stats data from backend
  const statsData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: t("admin.revenue"),
        value: formatPrice(stats.revenue.total),
        change: `${stats.revenue.change >= 0 ? "+" : ""}${stats.revenue.change.toFixed(1)}%`,
        trend: stats.revenue.trend,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: t("admin.orders"),
        value: stats.orders.total.toLocaleString("vi-VN"),
        change: `${stats.orders.change >= 0 ? "+" : ""}${stats.orders.change.toFixed(1)}%`,
        trend: stats.orders.trend,
        icon: ShoppingCart,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: t("admin.customers"),
        value: stats.customers.total.toLocaleString("vi-VN"),
        change: `${stats.customers.change >= 0 ? "+" : ""}${stats.customers.change.toFixed(1)}%`,
        trend: stats.customers.trend,
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: t("admin.products"),
        value: stats.products.total.toLocaleString("vi-VN"),
        change: `${stats.products.change >= 0 ? "+" : ""}${stats.products.change.toFixed(1)}%`,
        trend: stats.products.trend,
        icon: Package,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
    ];
  }, [stats, t]);

  // Revenue Chart Data
  const revenueChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: revenueChart?.months.map(formatMonthLabel) || [],
    },
    yaxis: {
      labels: {
        formatter: (value) => `${(value / 1000000).toFixed(0)}M`,
      },
    },
    colors: ["#ea4c89"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => formatPrice(value),
      },
    },
  }), [revenueChart, formatMonthLabel]);

  const revenueChartSeries = useMemo(() => [
    {
      name: t("dashboard.revenue"),
      data: revenueChart?.revenues || [],
    },
  ], [revenueChart, t]);

  // Orders Chart Data
  const ordersChartOptions: ApexOptions = useMemo(() => ({
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ordersChart?.months.map(formatMonthShortLabel) || [],
    },
    colors: ["#3b82f6"],
  }), [ordersChart, formatMonthShortLabel]);

  const ordersChartSeries = useMemo(() => [
    {
      name: t("dashboard.orders"),
      data: ordersChart?.orders || [],
    },
  ], [ordersChart, t]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: t("orders.statusPending"),
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800",
        };
      case "shipping":
      case "shipped":
        return {
          label: t("orders.statusShipping"),
          icon: Truck,
          className: "bg-blue-100 text-blue-800",
        };
      case "delivered":
        return {
          label: t("orders.statusDelivered"),
          icon: CheckCircle2,
          className: "bg-green-100 text-green-800",
        };
      case "cancelled":
        return {
          label: t("orders.statusCancelled"),
          icon: XCircle,
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: t("orders.statusPending"),
          icon: Clock,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Loading state
  if (authLoading || isLoadingDashboard) {
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

  // Products Distribution Chart
  const productsChartOptions: ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: [
      t("productTypes.serum"),
      t("productTypes.cream"),
      t("productTypes.lipstick"),
      t("productTypes.cleanser"),
      t("productTypes.other"),
    ],
    colors: ["#ea4c89", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"],
    legend: {
      position: "bottom",
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
    },
  };

  const productsChartSeries = [30, 25, 20, 15, 10];

  return (
    <AdminLayout>
      <PageTitle titleKey="adminDashboard" />
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">
            {t("admin.dashboard")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("admin.overview")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {t("dashboard.vsLastMonth")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t("dashboard.monthlyRevenue")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.revenueChartDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={revenueChartOptions}
                series={revenueChartSeries}
                type="area"
                height={280}
              />
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t("dashboard.monthlyOrders")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.ordersChartDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={ordersChartOptions}
                series={ordersChartSeries}
                type="bar"
                height={280}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Products Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("dashboard.productDistribution")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.productDistributionDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={productsChartOptions}
                series={productsChartSeries}
                type="donut"
                height={280}
              />
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {t("dashboard.topProducts")}
              </CardTitle>
              <CardDescription>{t("dashboard.topProductsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {t("dashboard.noTopProducts") || "Chưa có dữ liệu sản phẩm"}
                  </p>
                ) : (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t("products.sold")}: {product.sold} {t("products.products")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatPrice(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t("dashboard.recentOrders")}
            </CardTitle>
            <CardDescription>{t("dashboard.recentOrdersDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("adminOrders.orderId")}</TableHead>
                  <TableHead>{t("adminOrders.customer")}</TableHead>
                  <TableHead>{t("adminOrders.orderDate")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {t("dashboard.noRecentOrders") || "Chưa có đơn hàng nào"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        {new Date(order.date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const statusConfig = getStatusConfig(order.status === "shipped" ? "shipping" : order.status);
                          const StatusIcon = statusConfig.icon;
                          return (
                            <Badge className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPrice(order.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

