import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Award,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2,
  AlertTriangle,
  List,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useLazyImage } from "@/hooks/useLazyImage";
import useDebounce from "@/hooks/useDebounce";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchBrands, deleteBrand, clearBrandsError } from "@/stores/brands/action";
import { Brand } from "@/stores/brands/action";
import { AppDispatch, RootState } from "@/stores";

// Import Brand type from store

type SortField = "id" | "name" | "productCount";
type SortOrder = "asc" | "desc";

// Lazy Image Component for Brand Thumbnail
interface LazyBrandThumbnailProps {
  thumbnail?: string;
  name: string;
}

const LazyBrandThumbnail = ({ thumbnail, name }: LazyBrandThumbnailProps) => {
  const { imgRef, imageSrc, isLoaded } = useLazyImage(thumbnail);

  return (
    <div ref={imgRef}>
      <Avatar className="h-12 w-12">
        {isLoaded && imageSrc ? (
          <AvatarImage src={imageSrc} alt={name} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary">
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

const AdminBrands = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get brands from Redux store
  const { brands, loading: isLoadingBrands, error, pagination } = useSelector(
    (state: RootState) => state.brands
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<{ slug: string; name: string } | null>(null);
  const [stats, setStats] = useState({
    totalBrands: 0,
    totalProducts: 0,
    avgPerBrand: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Debounce search query với delay 0.5 giây (500ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch brands stats - chỉ load 1 lần khi component mount, không load lại khi filter thay đổi
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setIsLoadingStats(true);
      dispatch(fetchBrands({
        per_page: 1000, // Fetch all for stats
      }))
        .then((response) => {
          if (response && typeof response === 'object' && 'brands' in response) {
            const allBrands = (response as { brands: Brand[] }).brands;
            const totalBrands = allBrands.length;
            const totalProducts = allBrands.reduce((sum, brand) => sum + brand.productCount, 0);
            const avgPerBrand = totalBrands > 0 ? Math.round(totalProducts / totalBrands) : 0;
            
            setStats({
              totalBrands,
              totalProducts,
              avgPerBrand,
            });
          }
          setIsLoadingStats(false);
        })
        .catch(() => {
          setIsLoadingStats(false);
        });
    }
  }, [isAuthenticated, isAdmin, dispatch]); // Chỉ load 1 lần khi mount

  // Fetch brands from backend with pagination
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchBrands({
        page: currentPage,
        per_page: itemsPerPage,
        search: debouncedSearchQuery.trim() || undefined,
        sort_field: sortField === "productCount" ? "product_count" : sortField,
        sort_order: sortOrder,
      }));
    }
  }, [isAuthenticated, isAdmin, dispatch, currentPage, itemsPerPage, debouncedSearchQuery, sortField, sortOrder]);

  // Handle error
  useEffect(() => {
    if (error) {
      let errorMessage: string = "";
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
        dispatch(clearBrandsError());
      }
    }
  }, [error, toast, t, dispatch]);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Use pagination from backend
  const totalPages = pagination?.last_page || 1;
  const totalBrands = pagination?.total || 0;
  const startIndex = pagination?.from || 0;
  const endIndex = pagination?.to || 0;

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Reset to page 1 when debounced search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
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

  const handleExport = async () => {
    try {
      // Fetch all brands for export (without pagination)
      const allBrandsResponse = await dispatch(fetchBrands({
        per_page: 1000, // Get all for export
      }));
      
      const allBrands = (allBrandsResponse && typeof allBrandsResponse === 'object' && 'brands' in allBrandsResponse) 
        ? (allBrandsResponse as { brands: Brand[] }).brands 
        : brands;
      
      // Chuẩn bị dữ liệu để xuất
      const exportData = allBrands.map((brand: Brand) => {
        const statusLabel =
          brand.status === "active"
            ? t("adminBrands.statusActive")
            : t("adminBrands.statusInactive");
        return {
          ID: brand.id,
          [t("adminBrands.brandName")]: brand.name,
          [t("adminBrands.slug")]: brand.slug,
          [t("adminBrands.productCount")]: brand.productCount,
          [t("common.status")]: statusLabel,
          [t("adminBrands.description") || "Mô tả"]: brand.description || "-",
        };
      });

      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Điều chỉnh độ rộng cột
      const colWidths = [
        { wch: 8 }, // ID
        { wch: 25 }, // Tên thương hiệu
        { wch: 20 }, // Slug
        { wch: 12 }, // Số sản phẩm
        { wch: 12 }, // Trạng thái
        { wch: 40 }, // Mô tả
      ];
      ws["!cols"] = colWidths;

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t("adminBrands.title") || "Thương hiệu");

      // Tạo tên file với ngày tháng
      const fileName = `thuong-hieu-${new Date().toISOString().split("T")[0]}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);

      // Hiển thị thông báo thành công
      toast({
        title: t("adminBrands.exportData"),
        description: t("adminBrands.exportSuccess") || "Đã xuất file Excel thành công",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("adminBrands.exportError") || "Không thể xuất file Excel",
        variant: "destructive",
      });
    }
  };

  const handleAddBrand = () => {
    navigate("/admin/brands/add");
  };

  const handleEdit = (slug: string) => {
    navigate(`/admin/brands/${slug}/edit`);
  };

  const handleDeleteClick = (brandSlug: string, brandName: string) => {
    setBrandToDelete({ slug: brandSlug, name: brandName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;

    try {
      await dispatch(deleteBrand(brandToDelete.slug));
      toast({
        title: t("adminBrands.deleteBrand") || "Xóa thương hiệu",
        description: t("adminBrands.deletedBrand", { name: brandToDelete.name }) || `Đã xóa thương hiệu "${brandToDelete.name}"`,
      });
      setDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (error) {
      // Error đã được xử lý trong reducer và useEffect
      console.error("Error deleting brand:", error);
    }
  };

  const handleViewProducts = (brandSlug: string) => {
    navigate(`/products?brand=${brandSlug}`);
  };

  // Loading or not authenticated - chỉ hiển thị full page loading khi chưa có dữ liệu
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading") || "Đang tải..."}</p>
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-serif">
              {t("adminBrands.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("adminBrands.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t("adminBrands.exportExcel")}
            </Button>
            <Button onClick={handleAddBrand}>
              <Plus className="h-4 w-4 mr-2" />
              {t("adminBrands.addBrand")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminBrands.totalBrands")}</p>
                  <div className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats.totalBrands
                    )}
                  </div>
                </div>
                <Award className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{t("adminBrands.totalProducts")}</p>
                  <div className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      stats.totalProducts
                    )}
                  </div>
                </div>
                <Package className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("adminBrands.avgPerBrand")}
                  </p>
                  <div className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stats.avgPerBrand
                    )}
                  </div>
                </div>
                <Package className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brands Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{t("adminBrands.brandList")}</CardTitle>
                <CardDescription>
                  {t("common.showing")} {startIndex}-
                  {endIndex}{" "}
                  {t("common.of")} {totalBrands}{" "}
                  {t("adminBrands.products")}
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
                    <SelectItem value="5">
                      5 {t("adminBrands.products")}
                    </SelectItem>
                    <SelectItem value="10">
                      10 {t("adminBrands.products")}
                    </SelectItem>
                    <SelectItem value="15">
                      15 {t("adminBrands.products")}
                    </SelectItem>
                    <SelectItem value="20">
                      20 {t("adminBrands.products")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("adminBrands.searchPlaceholder")}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("id")}
                      >
                        ID
                        {getSortIcon("id")}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">
                      {t("adminBrands.thumbnail")}
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("name")}
                      >
                        {t("adminBrands.brandName")}
                        {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("adminBrands.slug")}</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("productCount")}
                      >
                        {t("adminBrands.productCount")}
                        {getSortIcon("productCount")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBrands ? (
                    // Skeleton rows khi đang loading
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`} className="hover:bg-accent">
                        {/* ID Column */}
                        <TableCell className="font-medium w-[80px]">
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                        {/* Thumbnail Column */}
                        <TableCell className="w-[100px]">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10">
                              <Skeleton className="h-12 w-12 rounded-full" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        {/* Name Column */}
                        <TableCell>
                          <div className="font-medium">
                            <Skeleton className="h-4 w-40" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <Skeleton className="h-3.5 w-32 mt-1" />
                          </div>
                        </TableCell>
                        {/* Slug Column */}
                        <TableCell>
                          <code className="text-xs bg-accent px-2 py-1 rounded inline-block">
                            <Skeleton className="h-4 w-24 bg-muted/40" />
                          </code>
                        </TableCell>
                        {/* Product Count Column */}
                        <TableCell className="text-right">
                          <span className="font-semibold">
                            <Skeleton className="h-4 w-8 inline-block" />
                          </span>
                          {" "}
                          <Skeleton className="h-3.5 w-16 inline-block ml-1" />
                        </TableCell>
                        {/* Status Column */}
                        <TableCell>
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </TableCell>
                        {/* Actions Column */}
                        <TableCell className="w-[70px]">
                          <Button variant="ghost" size="icon" className="h-10 w-10" disabled>
                            <Skeleton className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : brands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {t("adminBrands.noBrandsFound")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    brands.map((brand) => (
                      <TableRow key={brand.id} className="hover:bg-accent">
                        <TableCell className="font-medium">
                          #{brand.id}
                        </TableCell>
                        <TableCell>
                          <LazyBrandThumbnail
                            thumbnail={brand.thumbnail}
                            name={brand.name}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{brand.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {brand.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-accent px-2 py-1 rounded">
                            {brand.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold">
                            {brand.productCount}
                          </span>{" "}
                          {t("adminBrands.products")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={brand.status === "active" ? "default" : "secondary"}
                          >
                            {brand.status === "active"
                              ? t("adminBrands.statusActive")
                              : t("adminBrands.statusInactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewProducts(brand.slug)
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t("adminBrands.viewProducts")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(brand.slug)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteClick(brand.slug, brand.name)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Pagination info */}
                <div className="text-sm text-muted-foreground">
                  {t("common.page")} {currentPage} / {totalPages}
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
                  <span className="text-sm text-muted-foreground">
                    {t("common.goToPage")}:
                  </span>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <AlertDialogTitle className="text-left">
                    {t("adminBrands.deleteBrand") || "Xóa thương hiệu"}
                  </AlertDialogTitle>
                </div>
              </div>
            </AlertDialogHeader>
            <AlertDialogDescription className="text-left pt-2">
              {brandToDelete && (
                <>
                  {t("adminBrands.confirmDelete", { name: brandToDelete.name }) || 
                    `Bạn có chắc chắn muốn xóa thương hiệu "${brandToDelete.name}"?`}
                  <br />
                  <span className="text-muted-foreground text-xs mt-2 block">
                    Hành động này không thể hoàn tác.
                  </span>
                </>
              )}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBrandToDelete(null)}>
                {t("common.cancel") || "Hủy"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete") || "Xóa"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBrands;

