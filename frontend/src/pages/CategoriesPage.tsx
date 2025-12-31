import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  ChevronDown,
  X,
  Folder,
  Package,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  fetchCategoriesPaginated,
  type Category,
  type PaginationMeta,
} from "@/lib/api";

// Hàm lấy 2 chữ cái đầu của tên category cho logo
const getCategoryLogo = (categoryName: string): string => {
  const words = categoryName.split(" ");
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return categoryName.substring(0, 2).toUpperCase();
};

const CategoriesPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name-asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset về trang 1 khi search thay đổi
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Map sortBy to backend sort parameters
  const getSortParams = () => {
    switch (sortBy) {
      case "name-asc":
        return { sort_field: "name", sort_order: "asc" };
      case "name-desc":
        return { sort_field: "name", sort_order: "desc" };
      case "products-desc":
        return { sort_field: "product_count", sort_order: "desc" };
      case "products-asc":
        return { sort_field: "product_count", sort_order: "asc" };
      default:
        return { sort_field: "name", sort_order: "asc" };
    }
  };

  // Prepare API params
  const apiParams = {
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch.trim() || undefined,
    status: selectedStatus.length > 0 ? selectedStatus.join(",") : undefined,
    ...getSortParams(),
  };

  // Fetch categories from backend using React Query
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories", apiParams],
    queryFn: () => fetchCategoriesPaginated(apiParams),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesData?.categories || [];
  const pagination = categoriesData?.pagination || {
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, sortBy]);

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus([]);
    setSortBy("name-asc");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedStatus.length > 0;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Search */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Tìm kiếm</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Tìm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Trạng thái</h3>
        <div className="space-y-3">
          {["active", "inactive"].map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={selectedStatus.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              />
              <label
                htmlFor={`status-${status}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  // Render error state
  if (isError) {
    return (
      <>
        <Helmet>
          <title>Danh Mục | LuxeBeauty</title>
          <meta
            name="description"
            content="Khám phá các danh mục mỹ phẩm tại LuxeBeauty"
          />
        </Helmet>

        <Header />

        <main className="min-h-screen bg-background">
          {/* Breadcrumb */}
          <div className="bg-secondary/30 py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center space-x-2 text-sm">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Trang chủ
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">Danh mục</span>
              </div>
            </div>
          </div>

          {/* Error State */}
          <div className="py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Đã xảy ra lỗi</h2>
                <p className="text-muted-foreground mb-6">
                  Không thể tải danh sách danh mục. Vui lòng thử lại sau.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => refetch()} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Thử lại
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // Render loading state
  if (isLoading && !categoriesData) {
    return (
      <>
        <Helmet>
          <title>Danh Mục | LuxeBeauty</title>
          <meta
            name="description"
            content="Khám phá các danh mục mỹ phẩm tại LuxeBeauty"
          />
        </Helmet>

        <Header />

        <main className="min-h-screen bg-background">
          {/* Breadcrumb */}
          <div className="bg-secondary/30 py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center space-x-2 text-sm">
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Trang chủ
                </Link>
                <span className="text-muted-foreground">/</span>
                <span className="text-foreground font-medium">Danh mục</span>
              </div>
            </div>
          </div>

          {/* Page Header */}
          <div className="py-12">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <Skeleton className="h-4 w-32 mx-auto mb-3" />
                <Skeleton className="h-10 w-64 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto mt-2" />
              </div>

              {/* Filters and Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg border border-border overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-center mb-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-32 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto mb-3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12">
                <Skeleton className="h-10 w-64 mx-auto" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Danh Mục | LuxeBeauty</title>
        <meta
          name="description"
          content="Khám phá các danh mục mỹ phẩm tại LuxeBeauty"
        />
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-secondary/30 py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-2 text-sm">
              <Link
                to="/"
                className="text-muted-foreground hover:text-foreground"
              >
                Trang chủ
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">Danh mục</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
                Khám phá
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
                Danh Mục Sản Phẩm
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Khám phá các danh mục mỹ phẩm đa dạng tại LuxeBeauty. Mỗi danh
                mục đều được phân loại kỹ lưỡng để giúp bạn dễ dàng tìm thấy sản
                phẩm phù hợp với nhu cầu của mình.
              </p>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Bộ lọc</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-input rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 px-3"
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      {pagination.total} danh mục
                    </Badge>
                    {searchQuery && (
                      <Badge variant="outline" className="gap-1">
                        Tìm: "{searchQuery}"
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                    {selectedStatus.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        Trạng thái: {selectedStatus.length}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => setSelectedStatus([])}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Select */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Tên A-Z</SelectItem>
                    <SelectItem value="name-desc">Tên Z-A</SelectItem>
                    <SelectItem value="products-desc">
                      Nhiều sản phẩm nhất
                    </SelectItem>
                    <SelectItem value="products-asc">
                      Ít sản phẩm nhất
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Desktop Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Bộ lọc
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Bộ lọc</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Categories Grid/List */}
            {categories.length === 0 ? (
              <div className="text-center py-16">
                <Folder className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Không tìm thấy danh mục
                </h3>
                <p className="text-muted-foreground mb-6">
                  {hasActiveFilters
                    ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                    : "Hiện chưa có danh mục nào trong hệ thống"}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters}>Xóa bộ lọc</Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className={cn(
                      "group bg-card rounded-lg border border-border overflow-hidden",
                      "hover:border-accent/30 hover:shadow-elegant transition-all duration-300",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      {/* Category Logo/Initials */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-300">
                          <span className="text-2xl font-serif font-bold text-muted-foreground group-hover:text-accent transition-colors">
                            <img src={category.thumbnail} alt={category.name} className="w-16 h-16 object-cover rounded-full border" />
                          </span>
                        </div>
                      </div>

                      {/* Category Name */}
                      <h3 className="text-lg font-semibold text-center mb-2 line-clamp-1">
                        {category.name}
                      </h3>

                      {/* Product Count */}
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                        <Package className="h-4 w-4" />
                        <span>{category.productCount} sản phẩm</span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-center mb-4">
                        <Badge
                          variant={
                            category.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={cn(
                            category.status === "active"
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                              : "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
                          )}
                        >
                          {category.status === "active"
                            ? "Đang hoạt động"
                            : "Ngừng hoạt động"}
                        </Badge>
                      </div>

                      {/* Description */}
                      {category.description && (
                        <p className="text-sm text-muted-foreground text-center line-clamp-2 mb-4">
                          {category.description}
                        </p>
                      )}

                      {/* View Products Button */}
                      <Link to={`/san-pham?category=${category.slug}`}>
                        <Button variant="outline" className="w-full">
                          Xem sản phẩm
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div
                    key={category.id}
                    className={cn(
                      "group bg-card rounded-lg border border-border p-6",
                      "hover:border-accent/30 hover:shadow-elegant transition-all duration-300",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Category Logo/Initials */}
                      <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-300 flex-shrink-0">
                        <span className="text-lg font-serif font-bold text-muted-foreground group-hover:text-accent transition-colors">
                          {getCategoryLogo(category.name)}
                        </span>
                      </div>

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {category.name}
                          </h3>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="h-4 w-4" />
                              <span>{category.productCount} sản phẩm</span>
                            </div>
                            <Badge
                              variant={
                                category.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                category.status === "active"
                                  ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                  : "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20"
                              )}
                            >
                              {category.status === "active"
                                ? "Đang hoạt động"
                                : "Ngừng hoạt động"}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link to={`/san-pham?category=${category.slug}`}>
                            <Button variant="outline" size="sm">
                              Xem sản phẩm {category.slug}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {Array.from(
                      { length: Math.min(5, pagination.last_page) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.last_page <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.last_page - 2) {
                          pageNum = pagination.last_page - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    {/* Ellipsis for many pages */}
                    {pagination.last_page > 5 &&
                      currentPage < pagination.last_page - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                    {/* Last Page if not shown */}
                    {pagination.last_page > 5 &&
                      currentPage < pagination.last_page - 2 && (
                        <PaginationItem>
                          <PaginationLink
                            onClick={() =>
                              handlePageChange(pagination.last_page)
                            }
                            isActive={currentPage === pagination.last_page}
                            className="cursor-pointer"
                          >
                            {pagination.last_page}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                    {/* Next Button */}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.last_page, currentPage + 1)
                          )
                        }
                        className={
                          currentPage === pagination.last_page
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>

                {/* Pagination Info */}
                <div className="text-center mt-4 text-sm text-muted-foreground">
                  Hiển thị {pagination.from} - {pagination.to} của{" "}
                  {pagination.total} danh mục
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-secondary/30 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Tìm sản phẩm phù hợp với bạn
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Khám phá hàng ngàn sản phẩm mỹ phẩm chất lượng cao được phân loại
              theo danh mục. Từ skincare đến makeup, chúng tôi có tất cả những
              gì bạn cần cho vẻ đẹp hoàn hảo.
            </p>
            <Link to="/san-pham">
              <Button size="lg">Xem tất cả sản phẩm</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CategoriesPage;
