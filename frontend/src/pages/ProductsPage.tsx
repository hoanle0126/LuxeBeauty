import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import {
  Filter,
  Grid3X3,
  LayoutList,
  ChevronDown,
  X,
  Heart,
  ShoppingBag,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProductsWithFilters,
  useCategories,
  useBrands,
} from "@/hooks/useApi";
import type { Product } from "@/lib/api";

const priceRanges = [
  { label: "Dưới 500.000đ", min: 0, max: 500000 },
  { label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
  { label: "1.000.000đ - 2.000.000đ", min: 1000000, max: 2000000 },
  { label: "Trên 2.000.000đ", min: 2000000, max: Infinity },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const ProductsPage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);

  // Fetch categories and brands for filters
  const { data: categoriesData = [] } = useCategories();
  const { data: brandsData = [] } = useBrands();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const sortParam = searchParams.get("sort");
  const pageParam = searchParams.get("page");
  const itemsParam = searchParams.get("items");

  // Prepare API params
  const apiParams = {
    page: pageParam,
    per_page: perPage,
    category: categoryParam || undefined, // Chỉ gửi một category
    brand: brandParam || undefined,
    priceMin: priceMinParam ? parseFloat(priceMinParam) : undefined,
    priceMax: priceMaxParam ? parseFloat(priceMaxParam) : undefined,
    sort: sortParam as "newest" | "price-asc" | "price-desc" | "name-asc",
  };

  // Fetch products from backend
  const {
    data: productsData,
    isLoading,
    error,
  } = useProductsWithFilters(apiParams);

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || {
    current_page: 1,
    per_page: perPage,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    // Clear local state
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSelectedPriceRange(null);

    // Clear URL params
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    params.delete("brand");
    params.delete("priceMin");
    params.delete("priceMax");
    params.delete("page"); // Cũng nên xóa page param khi clear filters
    setSearchParams(params);
  };

  const hasActiveFilters =
    categoryParam !== null ||
    brandParam !== null ||
    priceMinParam !== null ||
    priceMaxParam !== null;

  // Handle page change
  const handlePageChange = (page: number) => {
    // Lấy tất cả params hiện tại
    const params = new URLSearchParams(searchParams);

    // Cập nhật page param
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page"); // Xóa page param nếu là trang 1
    }

    // Cập nhật URL
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories với vertical scroll */}
      <div>
        <h3 className="font-semibold mb-4">Danh Mục</h3>
        <RadioGroup
          value={categoryParam || ""}
          onValueChange={(value) => {
            const params = new URLSearchParams(searchParams);
            params.set("category", value);
            setSearchParams(params);
          }}
          className="space-y-3 max-h-60 overflow-y-auto pr-2"
        >
          {categoriesData.map((category) => (
            <div
              key={category.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <RadioGroupItem
                value={category.name}
                id={`category-${category.id}`}
              />
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer flex-1"
              >
                {category.name} ({category.productCount})
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Brands với vertical scroll */}
      <div>
        <h3 className="font-semibold mb-4">Thương Hiệu</h3>
        <RadioGroup
          value={brandParam || ""} // Lấy thương hiệu đầu tiên nếu có
          onValueChange={(value) => {
            // Với Radio Button chỉ chọn một, thay vì mảng
            const params = new URLSearchParams(searchParams);
            params.set("brand", value);
            setSearchParams(params);
          }}
          className="space-y-3 max-h-60 overflow-y-auto pr-2"
        >
          {brandsData.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <RadioGroupItem value={brand.name} id={`brand-${brand.id}`} />
              <label
                htmlFor={`brand-${brand.id}`}
                className="text-sm text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer flex-1"
              >
                {brand.name} ({brand.productCount})
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Price Range - Sử dụng RadioGroup thay vì Checkbox */}
      <div>
        <h3 className="font-semibold mb-4">Mức Giá</h3>
        <RadioGroup
          value={
            priceMinParam && priceMaxParam
              ? priceRanges
                  .findIndex(
                    (range) =>
                      range.min === parseInt(priceMinParam) &&
                      range.max ===
                        (priceMaxParam === "Infinity"
                          ? Infinity
                          : parseInt(priceMaxParam))
                  )
                  .toString()
              : ""
          }
          onValueChange={(value) => {
            const params = new URLSearchParams(searchParams);
            const index = parseInt(value);
            const range = priceRanges[index];
            if (range) {
              params.set("priceMin", range.min.toString());
              params.set("priceMax", range.max === Infinity ? "Infinity" : range.max.toString());
              setSearchParams(params);
            }
          }}
          className="space-y-3"
        >
          {priceRanges.map((range, index) => (
            <div
              key={range.label}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <RadioGroupItem value={index.toString()} id={`price-${index}`} />
              <label
                htmlFor={`price-${index}`}
                className="text-sm text-muted-foreground group-hover:text-foreground transition-colors cursor-pointer flex-1"
              >
                {range.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete("category");
            params.delete("brand");
            params.delete("priceMin");
            params.delete("priceMax");
            setSearchParams(params);
          }}
          className="w-full"
        >
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );

  // Loading skeleton
  const ProductSkeleton = () => (
    <div
      className={`bg-card rounded-xl overflow-hidden border border-border/50 ${
        viewMode === "list" ? "flex flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-secondary/50 ${
          viewMode === "list" ? "w-48 shrink-0" : "aspect-square"
        }`}
      >
        <Skeleton className="w-full h-full" />
      </div>
      <div
        className={`p-4 ${
          viewMode === "list" ? "flex-1 flex flex-col justify-center" : ""
        }`}
      >
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-48 mb-3" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Tất Cả Sản Phẩm - LuxeBeauty</title>
        <meta
          name="description"
          content="Khám phá bộ sưu tập mỹ phẩm cao cấp với hàng trăm sản phẩm từ các thương hiệu hàng đầu thế giới."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
                Tất Cả Sản Phẩm
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Khám phá bộ sưu tập mỹ phẩm cao cấp từ các thương hiệu hàng đầu
                thế giới
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Desktop Filters */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-32">
                  <h2 className="font-serif text-xl font-semibold mb-6">
                    Bộ Lọc
                  </h2>
                  <FilterContent />
                </div>
              </aside>

              {/* Products */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
                  <div className="flex items-center gap-4">
                    {/* Mobile Filter Button */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="lg:hidden gap-2">
                          <Filter className="w-4 h-4" />
                          Bộ lọc
                          {hasActiveFilters && (
                            <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">
                              {(selectedCategory !== null ? 1 : 0) +
                                selectedBrands.length +
                                (selectedPriceRange !== null ? 1 : 0)}
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-full sm:max-w-md">
                        <SheetHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                          <SheetTitle className="font-serif">Bộ Lọc</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 overflow-y-auto h-[calc(100vh-120px)] pr-2">
                          <FilterContent />
                        </div>
                      </SheetContent>
                    </Sheet>

                    <p className="text-sm text-muted-foreground">
                      Hiển thị{" "}
                      <span className="font-medium text-foreground">
                        {pagination.from || 0}-{pagination.to || 0}
                      </span>{" "}
                      trên{" "}
                      <span className="font-medium text-foreground">
                        {pagination.total}
                      </span>{" "}
                      sản phẩm
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <Select
                      value={sortParam || "newest"}
                      onValueChange={(value) =>
                        setSearchParams({ sort: value })
                      }
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Sắp xếp theo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mới nhất</SelectItem>
                        <SelectItem value="price-asc">
                          Giá: Thấp đến Cao
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Giá: Cao đến Thấp
                        </SelectItem>
                        <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Mode */}
                    <div className="hidden sm:flex items-center gap-1 border border-border rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setViewMode("grid")}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => setViewMode("list")}
                      >
                        <LayoutList className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    {categoryParam && ( // Sửa từ selectedCategories.map
                      <span
                        key={categoryParam}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm rounded-full"
                      >
                        {categoryParam}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete("category");
                            setSearchParams(params);
                          }} // Sửa từ toggleCategory
                          className="hover:text-accent"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {brandParam && (
                      <span
                        key={brandParam}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm rounded-full"
                      >
                        {brandParam}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete("brand");
                            setSearchParams(params);
                          }}
                          className="hover:text-accent"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {priceMinParam && priceMaxParam && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-sm rounded-full">
                        {priceMinParam} - {priceMaxParam}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete("priceMin");
                            params.delete("priceMax");
                            setSearchParams(params);
                          }}
                          className="hover:text-accent"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-sm text-accent hover:underline"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-20">
                    <p className="text-destructive mb-4">
                      Đã xảy ra lỗi khi tải sản phẩm
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      Thử lại
                    </Button>
                  </div>
                )}

                {/* Product Grid */}
                {isLoading ? (
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    }`}
                  >
                    {Array.from({ length: perPage }).map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div
                      className={`grid gap-6 ${
                        viewMode === "grid"
                          ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                          : "grid-cols-1"
                      }`}
                    >
                      {products.map((product) => (
                        <Link
                          to={`/san-pham/${product.slug || product.id}`}
                          key={product.id}
                          className={`group bg-card rounded-xl overflow-hidden border border-border/50 card-hover ${
                            viewMode === "list" ? "flex flex-row" : ""
                          }`}
                        >
                          {/* Image */}
                          <div
                            className={`relative overflow-hidden bg-secondary/50 ${
                              viewMode === "list"
                                ? "w-48 shrink-0"
                                : "aspect-square"
                            }`}
                          >
                            <img
                              src={product.image || ""}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {product.status === "available" &&
                                product.stock > 0 && (
                                  <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                                    Còn hàng
                                  </span>
                                )}
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                                    Sale
                                  </span>
                                )}
                            </div>

                            {/* Add to Cart */}
                            {viewMode === "grid" && (
                              <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <Button
                                  variant="default"
                                  className="w-full gap-2 rounded-full shadow-elegant"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                  Thêm vào giỏ
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div
                            className={`p-4 ${
                              viewMode === "list"
                                ? "flex-1 flex flex-col justify-center"
                                : ""
                            }`}
                          >
                            <p className="text-xs text-muted-foreground mb-1">
                              {product.brand}
                            </p>
                            <h3 className="font-medium text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Stock Status */}
                            <div className="mb-3">
                              {product.status === "available" &&
                              product.stock > 0 ? (
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                  Còn {product.stock} sản phẩm
                                </span>
                              ) : product.status === "low_stock" ? (
                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                  Sắp hết hàng
                                </span>
                              ) : (
                                <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                                  Hết hàng
                                </span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                            </div>

                            {viewMode === "list" && (
                              <Button variant="elegant" className="mt-4 w-fit">
                                Thêm vào giỏ
                              </Button>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>

                    {products.length === 0 && !isLoading && (
                      <div className="text-center py-20">
                        <p className="text-muted-foreground mb-4">
                          Không tìm thấy sản phẩm phù hợp
                        </p>
                        <Button variant="outline" onClick={clearFilters}>
                          Xóa bộ lọc
                        </Button>
                      </div>
                    )}

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                      <div className="mt-12">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  handlePageChange(pagination.current_page - 1)
                                }
                                className={
                                  pagination.current_page === 1
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>

                            {Array.from(
                              { length: Math.min(5, pagination.last_page) },
                              (_, i) => {
                                let pageNum;
                                if (pagination.last_page <= 5) {
                                  pageNum = i + 1;
                                } else if (pagination.current_page <= 3) {
                                  pageNum = i + 1;
                                } else if (
                                  pagination.current_page >=
                                  pagination.last_page - 2
                                ) {
                                  pageNum = pagination.last_page - 4 + i;
                                } else {
                                  pageNum = pagination.current_page - 2 + i;
                                }

                                return (
                                  <PaginationItem key={pageNum}>
                                    <PaginationLink
                                      onClick={() => handlePageChange(pageNum)}
                                      isActive={
                                        pageNum === pagination.current_page
                                      }
                                      className="cursor-pointer"
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                            )}

                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handlePageChange(pagination.current_page + 1)
                                }
                                className={
                                  pagination.current_page ===
                                  pagination.last_page
                                    ? "pointer-events-none opacity-50"
                                    : "cursor-pointer"
                                }
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>

                        <div className="text-center mt-4 text-sm text-muted-foreground">
                          Trang {pagination.current_page} /{" "}
                          {pagination.last_page}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;
