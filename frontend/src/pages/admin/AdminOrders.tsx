import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  MoreVertical,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchAdminOrders, deleteAdminOrder, type Order } from "@/lib/api";
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

// Mock orders data (for export only)
const mockOrders = [
  {
    id: "DH001",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    total: 1500000,
    status: "delivered",
    date: "2024-12-20",
    items: 2,
  },
  {
    id: "DH002",
    customer: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "0987654321",
    total: 2500000,
    status: "shipping",
    date: "2024-12-22",
    items: 3,
  },
  {
    id: "DH003",
    customer: "Lê Văn C",
    email: "levanc@example.com",
    phone: "0909090909",
    total: 950000,
    status: "pending",
    date: "2024-12-21",
    items: 2,
  },
  {
    id: "DH004",
    customer: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "0938383838",
    total: 3200000,
    status: "delivered",
    date: "2024-12-19",
    items: 5,
  },
  {
    id: "DH005",
    customer: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "0971717171",
    total: 1800000,
    status: "shipping",
    date: "2024-12-20",
    items: 3,
  },
  {
    id: "DH006",
    customer: "Vũ Thị F",
    email: "vuthif@example.com",
    phone: "0962626262",
    total: 4500000,
    status: "pending",
    date: "2024-12-23",
    items: 6,
  },
  {
    id: "DH007",
    customer: "Đặng Văn G",
    email: "dangvang@example.com",
    phone: "0953535353",
    total: 1200000,
    status: "cancelled",
    date: "2024-12-18",
    items: 1,
  },
  {
    id: "DH008",
    customer: "Bùi Thị H",
    email: "buithih@example.com",
    phone: "0944444444",
    total: 2800000,
    status: "delivered",
    date: "2024-12-17",
    items: 4,
  },
];

type OrderStatus = "all" | "pending" | "shipping" | "delivered" | "cancelled";
type SortField = "id" | "customer" | "date" | "total" | "status";
type SortOrder = "asc" | "desc";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  } | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<{ id: number; orderNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    // Chỉ redirect khi đã load xong và không phải admin
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Fetch orders from API
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const status = statusFilter === "all" ? undefined : statusFilter;
        const { orders: fetchedOrders, pagination: paginationData } = await fetchAdminOrders({
          page: currentPage,
          per_page: itemsPerPage,
          status: status === "shipping" ? "shipped" : status, // Map "shipping" to "shipped" for backend
          search: searchQuery || undefined,
          sort_field: sortField === "date" ? "created_at" : sortField === "customer" ? "user.name" : sortField,
          sort_order: sortOrder,
        });

        setOrders(fetchedOrders);
        setPagination(paginationData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: t("common.error") || "Lỗi",
          description: t("adminOrders.fetchError") || "Không thể tải danh sách đơn hàng",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, isAdmin, currentPage, itemsPerPage, statusFilter, searchQuery, sortField, sortOrder, toast, t]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: t("orders.statusPending"),
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800",
        };
      case "shipping":
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

  // Handle delete order
  const handleDeleteClick = (order: Order) => {
    setOrderToDelete({ id: order.id, orderNumber: order.orderNumber });
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAdminOrder(orderToDelete.id);
      
      toast({
        title: t("adminOrders.deleteOrder") || "Đã xóa đơn hàng",
        description: t("adminOrders.deleteOrderDesc", { id: orderToDelete.orderNumber }) || `Đã xóa đơn hàng ${orderToDelete.orderNumber}`,
      });

      // Reload orders
      const status = statusFilter === "all" ? undefined : statusFilter;
      const { orders: fetchedOrders, pagination: paginationData } = await fetchAdminOrders({
        page: currentPage,
        per_page: itemsPerPage,
        status: status === "shipping" ? "shipped" : status,
        search: searchQuery || undefined,
        sort_field: sortField === "date" ? "created_at" : sortField === "customer" ? "user.name" : sortField,
        sort_order: sortOrder,
      });

      setOrders(fetchedOrders);
      setPagination(paginationData);
      
      setOrderToDelete(null);
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("adminOrders.deleteError") || "Không thể xóa đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination
  const totalPages = pagination?.last_page || 1;
  const paginatedOrders = orders;

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default desc order
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-2 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-2 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-2 text-primary" />
    );
  };

  // Status counts (tạm thời dùng orders hiện tại, có thể fetch riêng nếu cần)
  const statusCounts = {
    all: pagination?.total || 0,
    pending: orders.filter((o) => o.status === "pending").length,
    shipping: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const handleExport = () => {
    try {
      // Chuẩn bị dữ liệu để xuất
      const exportData = orders.map((order) => {
        const statusConfig = getStatusConfig(order.status === "shipped" ? "shipping" : order.status);
        return {
          [t("adminOrders.orderId")]: order.orderNumber,
          [t("adminOrders.customer")]: order.shippingName || order.user?.name || "",
          [t("adminOrders.email") || "Email"]: order.shippingEmail || order.user?.email || "",
          [t("adminOrders.phone") || "Số điện thoại"]: order.shippingPhone || order.user?.phone || "",
          [t("adminOrders.orderDate")]: formatDate(order.createdAt || ""),
          [t("adminOrders.products")]: order.items?.length || 0,
          [t("common.status")]: statusConfig.label,
          [t("adminOrders.amount")]: formatPrice(order.total),
        };
      });

      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Điều chỉnh độ rộng cột
      const colWidths = [
        { wch: 12 }, // Mã đơn hàng
        { wch: 20 }, // Khách hàng
        { wch: 25 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 18 }, // Ngày đặt
        { wch: 10 }, // Số sản phẩm
        { wch: 15 }, // Trạng thái
        { wch: 15 }, // Tổng tiền
      ];
      ws["!cols"] = colWidths;

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t("adminOrders.title") || "Đơn hàng");

      // Tạo tên file với ngày tháng
      const fileName = `don-hang-${new Date().toISOString().split("T")[0]}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);

      // Hiển thị thông báo thành công
      toast({
        title: t("admin.exportData") || "Xuất dữ liệu",
        description: t("adminOrders.exportSuccess") || "Đã xuất file Excel thành công",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("adminOrders.exportError") || "Không thể xuất file Excel",
        variant: "destructive",
      });
    }
  };


  // Hiển thị loading hoặc không render nếu chưa authenticated
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (isLoadingOrders && orders.length === 0) {
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">
              {t("adminOrders.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("admin.orders")}
            </p>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t("adminOrders.exportExcel")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("common.all")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {statusCounts.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("orders.statusPending")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {statusCounts.shipping}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("orders.statusShipping")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {statusCounts.delivered}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("orders.statusDelivered")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {statusCounts.cancelled}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("orders.statusCancelled")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{t("adminOrders.title")}</CardTitle>
                <CardDescription>
                  {t("products.showing")} {pagination?.from || 0}-{pagination?.to || 0} {t("products.of")} {pagination?.total || 0} {t("admin.orders")}
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Items per page selector */}
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <List className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {t("admin.orders")}</SelectItem>
                    <SelectItem value="10">10 {t("admin.orders")}</SelectItem>
                    <SelectItem value="15">15 {t("admin.orders")}</SelectItem>
                    <SelectItem value="20">20 {t("admin.orders")}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("adminOrders.searchPlaceholder")}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Status Tabs */}
            <Tabs
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as OrderStatus)}
              className="mb-6"
            >
              <div className="overflow-x-auto">
                <TabsList className="inline-flex w-auto min-w-full" style={{ flexWrap: 'nowrap' }}>
                  <TabsTrigger value="all" className="whitespace-nowrap flex-shrink-0">{t("common.all")}</TabsTrigger>
                  <TabsTrigger value="pending" className="whitespace-nowrap flex-shrink-0">{t("orders.statusPending")}</TabsTrigger>
                  <TabsTrigger value="shipping" className="whitespace-nowrap flex-shrink-0">{t("orders.statusShipping")}</TabsTrigger>
                  <TabsTrigger value="delivered" className="whitespace-nowrap flex-shrink-0">{t("orders.statusDelivered")}</TabsTrigger>
                  <TabsTrigger value="cancelled" className="whitespace-nowrap flex-shrink-0">{t("orders.statusCancelled")}</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("id")}
                      >
                        {t("adminOrders.orderId")}
                        {getSortIcon("id")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("customer")}
                      >
                        {t("adminOrders.customer")}
                        {getSortIcon("customer")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("adminOrders.contact")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("date")}
                      >
                        {t("adminOrders.orderDate")}
                        {getSortIcon("date")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("adminOrders.products")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("status")}
                      >
                        {t("common.status")}
                        {getSortIcon("status")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("total")}
                      >
                        {t("adminOrders.amount")}
                        {getSortIcon("total")}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingOrders ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={8}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {t("orders.noOrders")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status === "shipped" ? "shipping" : order.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow
                          key={order.id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <TableCell className="font-medium">
                            #{order.orderNumber}
                          </TableCell>
                          <TableCell>{order.shippingName || order.user?.name || ""}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{order.shippingEmail || order.user?.email || ""}</div>
                              <div className="text-muted-foreground">
                                {order.shippingPhone || order.user?.phone || ""}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt || "")}</TableCell>
                          <TableCell>{order.items?.length || 0} {t("products.products")}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/orders/${order.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t("common.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(order);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("adminOrders.deleteOrder")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Pagination info */}
                <div className="text-sm text-muted-foreground">
                  {t("products.showing")} {pagination?.from || 0}-{pagination?.to || 0} {t("products.of")} {pagination?.total || 0}
                </div>

                {/* Pagination controls */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                {/* Quick jump to page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("adminOrders.goToPage")}:</span>
                  <Select
                    value={currentPage.toString()}
                    onValueChange={(value) => setCurrentPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <SelectItem key={page} value={page.toString()}>
                            {page}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Order Dialog */}
        <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminOrders.deleteOrder") || "Xóa đơn hàng"}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("adminOrders.confirmDelete", { id: orderToDelete?.orderNumber }) || `Bạn có chắc chắn muốn xóa đơn hàng ${orderToDelete?.orderNumber}?`}
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

export default AdminOrders;

