import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchProductsWithFilters, Product } from "@/lib/api";
import useDebounce from "@/hooks/useDebounce";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const searchProducts = async () => {
      if (!debouncedSearchQuery.trim()) {
        setFilteredProducts([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchProductsWithFilters({
          search: debouncedSearchQuery.trim(),
          per_page: 10, // Limit results for search dialog
        });

        setFilteredProducts(response.products);
      } catch (err) {
        console.error("Error searching products:", err);
        setError(t("search.error") || "Có lỗi xảy ra khi tìm kiếm sản phẩm");
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchProducts();
  }, [debouncedSearchQuery, t]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleProductClick = () => {
    setSearchQuery("");
    setFilteredProducts([]);
    setError(null);
    onOpenChange(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-12 text-center">
          <Loader2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">
            {t("search.loading") || "Đang tìm kiếm..."}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-12 text-center">
          <p className="text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            {t("search.tryAgain") || "Vui lòng thử lại sau"}
          </p>
        </div>
      );
    }

    if (searchQuery.trim() === "") {
      return (
        <div className="py-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("search.placeholder") || "Nhập từ khóa để tìm kiếm sản phẩm"}
          </p>
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {t("search.noResults") || "Không tìm thấy sản phẩm phù hợp"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("search.tryAgain") || "Vui lòng thử với từ khóa khác"}
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          {t("products.showing") || "Hiển thị"} {filteredProducts.length}{" "}
          {t("products.products") || "sản phẩm"}
        </p>
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              onClick={handleProductClick}
              className="block"
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={product.image || "/placeholder-image.jpg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.category || product.brand || "Không có danh mục"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-2xl font-bold font-serif">
            {t("search.results") || "Kết quả tìm kiếm"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search.placeholder") || "Tìm kiếm sản phẩm..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </div>

        <div className="px-6 pb-6 mt-4 overflow-auto flex-1 min-h-0">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;