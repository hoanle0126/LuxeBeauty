import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import useDebounce from "@/hooks/useDebounce";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  fetchAdminPromotions,
  createAdminPromotion,
  updateAdminPromotion,
  deleteAdminPromotion,
  Promotion,
} from "@/lib/api";
import PageTitle from "@/components/PageTitle";

type SortField = "id" | "code" | "name" | "startDate" | "endDate" | "status";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "active" | "inactive" | "expired";
type TypeFilter = "all" | "percentage" | "fixed";

const AdminPromotions = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("startDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  } | null>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<{ id: number; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    status: "active" as "active" | "inactive" | "expired",
  });

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Fetch promotions from API
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const loadPromotions = async () => {
      setIsLoadingPromotions(true);
      try {
        const status = statusFilter === "all" ? undefined : statusFilter;
        const type = typeFilter === "all" ? undefined : typeFilter;
        const { promotions: fetchedPromotions, pagination: paginationData } = await fetchAdminPromotions({
          page: currentPage,
          per_page: itemsPerPage,
          status,
          type,
          search: debouncedSearchQuery || undefined,
          sort_field: sortField === "startDate" ? "start_date" : sortField === "endDate" ? "end_date" : sortField,
          sort_order: sortOrder,
        });

        setPromotions(fetchedPromotions);
        setPagination(paginationData);
      } catch (error) {
        console.error("Error fetching promotions:", error);
        toast({
          title: t("common.error") || "Lỗi",
          description: t("promotions.fetchError") || "Không thể tải danh sách ưu đãi",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    loadPromotions();
  }, [isAuthenticated, isAdmin, currentPage, itemsPerPage, statusFilter, typeFilter, debouncedSearchQuery, sortField, sortOrder, toast, t]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, debouncedSearchQuery]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: t("promotions.statusActive"),
          icon: CheckCircle2,
          className: "bg-green-100 text-green-800",
        };
      case "inactive":
        return {
          label: t("promotions.statusInactive"),
          icon: Clock,
          className: "bg-gray-100 text-gray-800",
        };
      case "expired":
        return {
          label: t("promotions.statusExpired"),
          icon: XCircle,
          className: "bg-red-100 text-red-800",
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
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

  // Handle add
  const handleAdd = () => {
    setEditingPromotion(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description || "",
      type: promotion.type,
      value: promotion.value.toString(),
      minOrderAmount: promotion.minOrderAmount?.toString() || "",
      maxDiscountAmount: promotion.maxDiscountAmount?.toString() || "",
      usageLimit: promotion.usageLimit?.toString() || "",
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : "",
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : "",
      status: promotion.status,
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDeleteClick = (promotion: Promotion) => {
    setPromotionToDelete({ id: promotion.id, code: promotion.code });
  };

  const handleDeleteConfirm = async () => {
    if (!promotionToDelete) return;

    setIsDeleting(true);
    try {
      await deleteAdminPromotion(promotionToDelete.id);
      toast({
        title: t("promotions.deletePromotion") || "Đã xóa ưu đãi",
        description: t("promotions.deletePromotionDesc", { code: promotionToDelete.code }) || `Đã xóa ưu đãi "${promotionToDelete.code}"`,
      });
      setPromotionToDelete(null);
      
      // Reload promotions
      const { promotions: fetchedPromotions, pagination: paginationData } = await fetchAdminPromotions({
        page: currentPage,
        per_page: itemsPerPage,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        search: debouncedSearchQuery || undefined,
        sort_field: sortField === "startDate" ? "start_date" : sortField === "endDate" ? "end_date" : sortField,
        sort_order: sortOrder,
      });
      setPromotions(fetchedPromotions);
      setPagination(paginationData);
    } catch (error: any) {
      toast({
        title: t("common.error") || "Lỗi",
        description: error.response?.data?.message || t("promotions.deleteError") || "Không thể xóa ưu đãi",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.startDate || !formData.endDate) {
        toast({
          title: t("common.error") || "Lỗi",
          description: t("promotions.dateRequired") || "Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Debug: Log form data
      console.log("Form Data:", formData);
      console.log("Start Date:", formData.startDate);
      console.log("End Date:", formData.endDate);

      // Convert datetime-local to ISO string format
      // datetime-local format: "YYYY-MM-DDTHH:mm" (local time, no timezone)
      // We need to parse it as local time and convert to ISO string
      const parseLocalDateTime = (dateTimeString: string): string => {
        if (!dateTimeString || dateTimeString.trim() === "") {
          throw new Error("Empty datetime string");
        }

        // Split "YYYY-MM-DDTHH:mm" into date and time parts
        const [datePart, timePart] = dateTimeString.split('T');
        if (!datePart || !timePart) {
          throw new Error("Invalid datetime format: missing date or time part");
        }
        
        // Create a date object in local timezone
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        
        if (!year || !month || !day || !hours || !minutes) {
          throw new Error("Invalid datetime format: missing components");
        }
        
        // Create date object with local time
        const localDate = new Date(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          0, // seconds
          0  // milliseconds
        );
        
        // Check if date is valid
        if (isNaN(localDate.getTime())) {
          throw new Error("Invalid date: cannot create Date object");
        }
        
        // Convert to ISO string (this will include timezone offset)
        const isoString = localDate.toISOString();
        console.log("Parsed datetime:", dateTimeString, "->", isoString);
        return isoString;
      };

      let startDateISO: string;
      let endDateISO: string;

      try {
        startDateISO = parseLocalDateTime(formData.startDate);
        endDateISO = parseLocalDateTime(formData.endDate);
      } catch (error: any) {
        console.error("Date parsing error:", error);
        toast({
          title: t("common.error") || "Lỗi",
          description: error.message || t("promotions.invalidDate") || "Ngày tháng không hợp lệ",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Convert camelCase to snake_case for backend
      const data = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        value: parseFloat(formData.value),
        min_order_amount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        max_discount_amount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        start_date: startDateISO,
        end_date: endDateISO,
        status: formData.status,
      };

      console.log("Data to send:", data);

      if (editingPromotion) {
        await updateAdminPromotion(editingPromotion.id, data);
        toast({
          title: t("promotions.updatePromotion") || "Cập nhật ưu đãi",
          description: t("promotions.updatePromotionDesc") || "Đã cập nhật ưu đãi thành công",
        });
      } else {
        await createAdminPromotion(data);
        toast({
          title: t("promotions.createPromotion") || "Tạo ưu đãi",
          description: t("promotions.createPromotionDesc") || "Đã tạo ưu đãi thành công",
        });
      }

      setIsDialogOpen(false);
      
      // Reload promotions
      const { promotions: fetchedPromotions, pagination: paginationData } = await fetchAdminPromotions({
        page: currentPage,
        per_page: itemsPerPage,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        search: debouncedSearchQuery || undefined,
        sort_field: sortField === "startDate" ? "start_date" : sortField === "endDate" ? "end_date" : sortField,
        sort_order: sortOrder,
      });
      setPromotions(fetchedPromotions);
      setPagination(paginationData);
    } catch (error: any) {
      toast({
        title: t("common.error") || "Lỗi",
        description: error.response?.data?.message || t("promotions.saveError") || "Không thể lưu ưu đãi",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = promotions.length;
    const active = promotions.filter((p) => p.status === "active").length;
    const expired = promotions.filter((p) => p.status === "expired").length;
    const used = promotions.reduce((sum, p) => sum + p.usedCount, 0);

    return { total, active, expired, used };
  }, [promotions]);

  // Pagination
  const totalPages = pagination?.last_page || 1;

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
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

  return (
    <AdminLayout>
      <PageTitle titleKey="adminPromotions" />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">
              {t("promotions.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("promotions.description")}
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {t("promotions.addPromotion")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("common.all")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("promotions.statusActive")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("promotions.statusExpired")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
              <p className="text-xs text-muted-foreground mt-1">{t("promotions.totalUsed")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{t("promotions.title")}</CardTitle>
                <CardDescription>
                  {t("products.showing")} {pagination?.from || 0}-{pagination?.to || 0} {t("products.of")} {pagination?.total || 0} {t("promotions.promotions")}
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Items per page selector */}
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("promotions.searchPlaceholder")}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Status and Type Filters */}
            <div className="space-y-4 mb-6">
              {/* Status Filter */}
              <div className="flex gap-2 overflow-x-auto" style={{ flexWrap: 'nowrap' }}>
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  {t("common.all")}
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("active");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  {t("promotions.statusActive")}
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("inactive");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  {t("promotions.statusInactive")}
                </Button>
                <Button
                  variant={statusFilter === "expired" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("expired");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  {t("promotions.statusExpired")}
                </Button>
              </div>

              {/* Type Filter */}
              <div className="flex gap-2 overflow-x-auto" style={{ flexWrap: 'nowrap' }}>
                <Button
                  variant={typeFilter === "all" ? "default" : "outline"}
                  onClick={() => {
                    setTypeFilter("all");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  {t("common.all")}
                </Button>
                <Button
                  variant={typeFilter === "percentage" ? "default" : "outline"}
                  onClick={() => {
                    setTypeFilter("percentage");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  <Percent className="h-4 w-4 mr-2" />
                  {t("promotions.typePercentage")}
                </Button>
                <Button
                  variant={typeFilter === "fixed" ? "default" : "outline"}
                  onClick={() => {
                    setTypeFilter("fixed");
                    setCurrentPage(1);
                  }}
                  className="whitespace-nowrap flex-shrink-0 min-w-[120px]"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t("promotions.typeFixed")}
                </Button>
              </div>
            </div>

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
                        {t("promotions.id")}
                        {getSortIcon("id")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("code")}
                      >
                        {t("promotions.code")}
                        {getSortIcon("code")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("name")}
                      >
                        {t("promotions.name")}
                        {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("promotions.type")}</TableHead>
                    <TableHead>{t("promotions.value")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("startDate")}
                      >
                        {t("promotions.startDate")}
                        {getSortIcon("startDate")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("endDate")}
                      >
                        {t("promotions.endDate")}
                        {getSortIcon("endDate")}
                      </Button>
                    </TableHead>
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
                    <TableHead>{t("promotions.usage")}</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingPromotions ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={10}>
                          <Skeleton className="h-12 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : promotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {t("promotions.noPromotions")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    promotions.map((promotion) => {
                      const statusConfig = getStatusConfig(promotion.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow key={promotion.id}>
                          <TableCell className="font-medium">#{promotion.id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {promotion.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{promotion.name}</TableCell>
                          <TableCell>
                            {promotion.type === "percentage" ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Percent className="h-3 w-3 mr-1" />
                                {t("promotions.typePercentage")}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {t("promotions.typeFixed")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {promotion.type === "percentage" ? (
                              <span className="font-medium">{promotion.value}%</span>
                            ) : (
                              <span className="font-medium">{formatPrice(promotion.value)}</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(promotion.startDate)}</TableCell>
                          <TableCell>{formatDate(promotion.endDate)}</TableCell>
                          <TableCell>
                            <Badge className={statusConfig.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {promotion.usageLimit ? (
                              <span className="text-sm">
                                {promotion.usedCount} / {promotion.usageLimit}
                              </span>
                            ) : (
                              <span className="text-sm">{promotion.usedCount}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(promotion)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteClick(promotion)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("common.delete")}
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
                <div className="text-sm text-muted-foreground">
                  {t("products.showing")} {pagination?.from || 0}-{pagination?.to || 0} {t("products.of")} {pagination?.total || 0}
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? t("promotions.editPromotion") : t("promotions.addPromotion")}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion ? t("promotions.editPromotionDesc") : t("promotions.addPromotionDesc")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{t("promotions.code")} *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("promotions.name")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("promotions.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">{t("promotions.type")} *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "percentage" | "fixed" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 mr-2" />
                          {t("promotions.typePercentage")}
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {t("promotions.typeFixed")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">
                    {t("promotions.value")} * ({formData.type === "percentage" ? "%" : "VND"})
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step={formData.type === "percentage" ? "0.01" : "1000"}
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">{t("promotions.minOrderAmount")}</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">{t("promotions.maxDiscountAmount")}</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">{t("promotions.usageLimit")}</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder={t("promotions.unlimited")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t("common.status")}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as "active" | "inactive" | "expired" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("promotions.statusActive")}</SelectItem>
                      <SelectItem value="inactive">{t("promotions.statusInactive")}</SelectItem>
                      <SelectItem value="expired">{t("promotions.statusExpired")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("promotions.startDate")} *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("promotions.endDate")} *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!promotionToDelete} onOpenChange={(open) => !open && setPromotionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("promotions.deletePromotion")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("promotions.confirmDelete", { code: promotionToDelete?.code }) || `Bạn có chắc chắn muốn xóa ưu đãi "${promotionToDelete?.code}"?`}
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

export default AdminPromotions;

