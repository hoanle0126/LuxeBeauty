import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  DollarSign,
  List,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useLazyImage } from "@/hooks/useLazyImage";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/admin/AdminLayout";
import FilterCombobox from "@/components/admin/FilterCombobox";
import {
  fetchProducts,
  fetchProductsStats,
  deleteProduct,
  clearProductsError,
  ProductStats,
} from "@/stores/products/action";
import { fetchCategories } from "@/stores/categories/action";
import { fetchBrands } from "@/stores/brands/action";
import { AppDispatch, RootState } from "@/stores";
import { Product } from "@/stores/products/action";
import { Category } from "@/stores/categories/action";
import { Brand } from "@/stores/brands/action";

type ProductStatus =
  | "all"
  | "available"
  | "low_stock"
  | "out_of_stock"
  | "discontinued";
type SortField = "id" | "name" | "price" | "stock" | "category" | "createdAt";
type SortOrder = "asc" | "desc";

// Lazy Image Component for Product Image
interface LazyProductImageProps {
  image?: string;
  name: string;
}

const LazyProductImage = ({ image, name }: LazyProductImageProps) => {
  const { imgRef, imageSrc, isLoaded } = useLazyImage(image);

  return (
    <div ref={imgRef} className="w-[48px]">
      {isLoaded && imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get products from Redux store
  const {
    products,
    loading: isLoadingProducts,
    error,
    pagination,
  } = useSelector((state: RootState) => state.products);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    statusCounts: {
      all: 0,
      available: 0,
      low_stock: 0,
      out_of_stock: 0,
      discontinued: 0,
    },
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Debounce search query với delay 0.5 giây (500ms)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset to page 1 when debounced search query, status filter, category filter, or brand filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, categoryFilter, brandFilter]);

  // Fetch products from backend with pagination
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchProducts({
        page: currentPage,
        per_page: itemsPerPage,
        search: debouncedSearchQuery.trim() || undefined,
        sort_field: sortField === "category" ? "category" : sortField,
        sort_order: sortOrder,
        status: statusFilter !== "all" ? statusFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        brand: brandFilter !== "all" ? brandFilter : undefined,
      }));
    }
  }, [isAuthenticated, isAdmin, dispatch, currentPage, itemsPerPage, debouncedSearchQuery, sortField, sortOrder, statusFilter, categoryFilter, brandFilter]);

  // Fetch products stats - chỉ load 1 lần khi component mount, không load lại khi filter thay đổi
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setIsLoadingStats(true);
      dispatch(fetchProductsStats({}))
        .then((statsData) => {
          setStats(statsData);
          setIsLoadingStats(false);
        })
        .catch(() => {
          setIsLoadingStats(false);
        });
    }
  }, [isAuthenticated, isAdmin, dispatch]); // Chỉ load 1 lần khi mount

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
          description:
            errorMessage.length > 100
              ? `${errorMessage.substring(0, 100)}...`
              : errorMessage,
          variant: "destructive",
        });
        dispatch(clearProductsError());
      }
    }
  }, [error, toast, t, dispatch]);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "-";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return {
          label: t("products.statusAvailable"),
          className: "bg-green-500 text-white hover:bg-green-600",
        };
      case "low_stock":
        return {
          label: t("products.statusLowStock"),
          className: "bg-orange-500 text-white hover:bg-orange-600",
        };
      case "out_of_stock":
        return {
          label: t("products.statusOutOfStock"),
          className: "bg-red-500 text-white hover:bg-red-600",
        };
      case "discontinued":
        return {
          label: t("products.statusDiscontinued"),
          className: "bg-black text-white hover:bg-gray-900",
        };
      default:
        return {
          label: t("common.unknown"),
          className: "bg-gray-500 text-white hover:bg-gray-600",
        };
    }
  };

  // Fetch all categories for filter dropdown (lazy load)
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesHasMore, setCategoriesHasMore] = useState(true);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const categoriesPerPage = 20; // Load 20 categories mỗi lần

  // Fetch categories for dropdown
  const loadCategories = async (page: number, append: boolean = false) => {
    if (categoriesLoading || (!categoriesHasMore && page > 1)) return;
    
    setCategoriesLoading(true);
    try {
      const response = await dispatch(fetchCategories({
        page,
        per_page: categoriesPerPage,
      }));
      
      if (response && typeof response === 'object' && 'categories' in response) {
        const newCategories = (response as { categories: Category[] }).categories;
        const pagination = (response as { pagination: { total?: number; last_page?: number } }).pagination;
        
        if (append) {
          setAllCategories(prev => [...prev, ...newCategories]);
        } else {
          setAllCategories(newCategories);
        }
        
        if (pagination) {
          setCategoriesTotal(pagination.total || 0);
          if (pagination.last_page && page >= pagination.last_page) {
            setCategoriesHasMore(false);
          } else {
            setCategoriesHasMore(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load initial categories
  useEffect(() => {
    if (isAuthenticated && isAdmin && allCategories.length === 0) {
      loadCategories(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, dispatch]);

  // Get unique category names for display (keep all categories, not filtered)
  const categoryNames = useMemo(() => {
    return allCategories.map(cat => cat.name);
  }, [allCategories]);

  // Fetch all brands for filter dropdown (lazy load)
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [brandsPage, setBrandsPage] = useState(1);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsHasMore, setBrandsHasMore] = useState(true);
  const [brandsTotal, setBrandsTotal] = useState(0);
  const brandsPerPage = 20; // Load 20 brands mỗi lần

  // Fetch brands for dropdown
  const loadBrands = async (page: number, append: boolean = false) => {
    if (brandsLoading || (!brandsHasMore && page > 1)) return;
    
    setBrandsLoading(true);
    try {
      const response = await dispatch(fetchBrands({
        page,
        per_page: brandsPerPage,
      }));
      
      if (response && typeof response === 'object' && 'brands' in response) {
        const newBrands = (response as { brands: Brand[] }).brands;
        const pagination = (response as { pagination: { total?: number; last_page?: number } }).pagination;
        
        if (append) {
          setAllBrands(prev => [...prev, ...newBrands]);
        } else {
          setAllBrands(newBrands);
        }
        
        if (pagination) {
          setBrandsTotal(pagination.total || 0);
          if (pagination.last_page && page >= pagination.last_page) {
            setBrandsHasMore(false);
          } else {
            setBrandsHasMore(true);
          }
        }
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Load initial brands
  useEffect(() => {
    if (isAuthenticated && isAdmin && allBrands.length === 0) {
      loadBrands(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, dispatch]);

  // Get unique brand names for display (keep all brands, not filtered)
  const brandNames = useMemo(() => {
    return allBrands.map(brand => brand.name);
  }, [allBrands]);

  // Use pagination from backend
  const totalPages = pagination?.last_page || 1;
  const totalProducts = pagination?.total || 0;
  const startIndex = pagination?.from || 0;
  const endIndex = pagination?.to || 0;

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

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

  // Use stats from API
  const statusCounts = stats.statusCounts;
  const totalStock = stats.totalStock;
  const totalValue = stats.totalValue;

  const handleExport = async () => {
    try {
      // Fetch all products for export (without pagination)
      const allProductsResponse = await dispatch(fetchProducts({
        per_page: 1000, // Get all for export
      }));
      
      const allProducts = (allProductsResponse && typeof allProductsResponse === 'object' && 'products' in allProductsResponse) 
        ? (allProductsResponse as { products: Product[] }).products 
        : products;
      
      // Chuẩn bị dữ liệu để xuất
      const exportData = allProducts.map((product) => {
        const statusConfig = getStatusConfig(product.status);
        return {
          ID: product.id,
          [t("products.productName")]: product.name,
          [t("products.category")]: product.category || "-",
          [t("products.brand")]: product.brand || "-",
          [t("products.price")]: product.price,
          [t("products.stock")]: product.stock,
          [t("common.status")]: statusConfig.label,
          [t("products.createdAt")]: formatDate(product.createdAt),
        };
      });

      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Điều chỉnh độ rộng cột
      const colWidths = [
        { wch: 8 }, // ID
        { wch: 30 }, // Tên sản phẩm
        { wch: 20 }, // Danh mục
        { wch: 20 }, // Thương hiệu
        { wch: 15 }, // Giá
        { wch: 10 }, // Tồn kho
        { wch: 15 }, // Trạng thái
        { wch: 20 }, // Ngày tạo
      ];
      ws["!cols"] = colWidths;

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t("products.title") || "Sản phẩm");

      // Tạo tên file với ngày tháng
      const fileName = `san-pham-${new Date().toISOString().split("T")[0]}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);

      // Hiển thị thông báo thành công
      toast({
        title: t("products.exportData"),
        description: t("products.exportSuccess") || "Đã xuất file Excel thành công",
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("products.exportError") || "Không thể xuất file Excel",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = () => {
    navigate("/admin/products/add");
  };

  const handleEdit = (slug: string) => {
    navigate(`/admin/products/${slug}/edit`);
  };

  const handleDeleteClick = (slug: string, name: string) => {
    setProductToDelete({ slug, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await dispatch(deleteProduct(productToDelete.slug));
      toast({
        title: t("products.deleteProduct"),
        description: t("products.deletedProduct", {
          name: productToDelete.name,
        }),
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      // Refresh products list
      dispatch(fetchProducts());
    } catch (error) {
      // Error already handled in useEffect
    }
  };

  // Loading or not authenticated - chỉ hiển thị full page loading khi chưa có dữ liệu
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              {t("products.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("products.manageAllProducts")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              {t("products.exportExcel")}
            </Button>
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              {t("products.addProduct")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("products.totalProducts")}
                  </p>
                  <div className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-12" />
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
                    {t("products.totalStock")}
                  </p>
                  <div className="text-2xl font-bold mt-1">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      totalStock
                    )}
                  </div>
                </div>
                <List className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("products.stockValue")}
                  </p>
                  <div className="text-xl font-bold mt-1">
                    {isLoadingStats ? (
                      <Skeleton className="h-7 w-24" />
                    ) : (
                      formatPrice(totalValue)
                    )}
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("products.lowStock")}
                  </p>
                  <div className="text-2xl font-bold mt-1 text-yellow-600">
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-8" />
                    ) : (
                      statusCounts.low_stock
                    )}
                  </div>
                </div>
                <AlertCircle className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>{t("products.productList")}</CardTitle>
                <CardDescription>
                  {t("common.showing")} {startIndex}-
                  {endIndex}{" "}
                  {t("common.of")} {totalProducts}{" "}
                  {t("products.products")}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Brand filter with lazy loading */}
                <FilterCombobox
                  items={brandNames}
                  selectedValue={brandFilter}
                  onSelect={setBrandFilter}
                  loading={brandsLoading}
                  hasMore={brandsHasMore}
                  onLoadMore={() => {
                    const nextPage = brandsPage + 1;
                    setBrandsPage(nextPage);
                    loadBrands(nextPage, true);
                  }}
                  placeholder={t("products.brand")}
                  searchPlaceholder={t("products.searchBrand") || "Tìm thương hiệu..."}
                  allLabel={t("products.allBrands") || "Tất cả thương hiệu"}
                  total={brandsTotal}
                />

                {/* Category filter with lazy loading */}
                <FilterCombobox
                  items={categoryNames}
                  selectedValue={categoryFilter}
                  onSelect={setCategoryFilter}
                  loading={categoriesLoading}
                  hasMore={categoriesHasMore}
                  onLoadMore={() => {
                    const nextPage = categoriesPage + 1;
                    setCategoriesPage(nextPage);
                    loadCategories(nextPage, true);
                  }}
                  placeholder={t("products.category")}
                  searchPlaceholder={t("products.searchCategory") || "Tìm danh mục..."}
                  allLabel={t("products.allCategories")}
                  total={categoriesTotal}
                />

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
                      5 {t("products.products")}
                    </SelectItem>
                    <SelectItem value="10">
                      10 {t("products.products")}
                    </SelectItem>
                    <SelectItem value="15">
                      15 {t("products.products")}
                    </SelectItem>
                    <SelectItem value="20">
                      20 {t("products.products")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("products.searchProducts")}
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
              onValueChange={(v) => setStatusFilter(v as ProductStatus)}
              className="mb-6"
            >
              <div className="overflow-x-auto">
                <TabsList
                  className="inline-flex w-auto min-w-full"
                  style={{ flexWrap: "nowrap" }}
                >
                  <TabsTrigger
                    value="all"
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {t("common.all")} ({statusCounts.all})
                  </TabsTrigger>
                  <TabsTrigger
                    value="available"
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {t("products.statusAvailable")} ({statusCounts.available})
                  </TabsTrigger>
                  <TabsTrigger
                    value="low_stock"
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {t("products.statusLowStock")} ({statusCounts.low_stock})
                  </TabsTrigger>
                  <TabsTrigger
                    value="out_of_stock"
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {t("products.statusOutOfStock")} (
                    {statusCounts.out_of_stock})
                  </TabsTrigger>
                  <TabsTrigger
                    value="discontinued"
                    className="whitespace-nowrap flex-shrink-0"
                  >
                    {t("products.statusDiscontinued")} (
                    {statusCounts.discontinued})
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("id")}
                      >
                        ID
                        {getSortIcon("id")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("products.image")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("name")}
                      >
                        {t("products.productName")}
                        {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("category")}
                      >
                        {t("products.category")}
                        {getSortIcon("category")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("products.brand")}</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("price")}
                      >
                        {t("products.price")}
                        {getSortIcon("price")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("stock")}
                      >
                        {t("products.stock")}
                        {getSortIcon("stock")}
                      </Button>
                    </TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                        onClick={() => handleSort("createdAt")}
                      >
                        {t("products.createdAt") || "Ngày tạo"}
                        {getSortIcon("createdAt")}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingProducts ? (
                    // Skeleton rows khi đang loading
                    Array.from({ length: itemsPerPage }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`} className="hover:bg-accent">
                        {/* ID Column */}
                        <TableCell className="font-medium w-[60px]">
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                        {/* Image Column */}
                        <TableCell>
                          <div className="w-[48px]">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                          </div>
                        </TableCell>
                        {/* Name Column */}
                        <TableCell className="max-w-xs">
                          <div className="font-medium w-[200px]">
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </TableCell>
                        {/* Category Column */}
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        {/* Brand Column */}
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        {/* Price Column */}
                        <TableCell className="text-right font-semibold">
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </TableCell>
                        {/* Stock Column */}
                        <TableCell className="text-right">
                          <Skeleton className="h-4 w-12 ml-auto" />
                        </TableCell>
                        {/* Status Column */}
                        <TableCell>
                          <Skeleton className="h-6 w-[100px] rounded-full" />
                        </TableCell>
                        {/* Created At Column */}
                        <TableCell className="text-sm text-muted-foreground">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        {/* Actions Column */}
                        <TableCell className="w-[70px]">
                          <Button variant="ghost" size="icon" className="h-10 w-10" disabled>
                            <Skeleton className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <p className="text-muted-foreground">
                          {t("products.noProductsFound")}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const statusConfig = getStatusConfig(product.status);

                      return (
                        <TableRow key={product.id} className="hover:bg-accent">
                          <TableCell className="font-medium">
                            #{product.id}
                          </TableCell>
                          <TableCell>
                            <LazyProductImage
                              image={product.image}
                              name={product.name}
                            />
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="font-medium w-[200px]">{product.name}</div>
                          </TableCell>
                          <TableCell>{product.category || "-"}</TableCell>
                          <TableCell>
                            {product.brand ? (
                              <span className="text-sm">{product.brand}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(product.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                product.stock < 10
                                  ? "text-red-600 font-semibold"
                                  : product.stock < 30
                                  ? "text-yellow-600 font-semibold"
                                  : ""
                              }
                            >
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "w-[100px]",
                                statusConfig.className
                              )}
                            >
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(product.createdAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  {t("common.actions")}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/admin/products/${product.slug}`)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t("common.viewDetails")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(
                                      `/product/${product.slug}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  {t("products.viewOnWeb")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(product.slug)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    handleDeleteClick(
                                      product.slug,
                                      product.name
                                    )
                                  }
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
              <AlertDialogTitle>{t("products.confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("products.deleteWarning", {
                  name: productToDelete?.name || "",
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
