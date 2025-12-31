import { Award, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Brand } from "@/lib/api";

interface BrandsProps {
  brands?: Brand[];
  isLoading?: boolean;
}

const Brands = ({ brands = [], isLoading = false }: BrandsProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Hàm tạo URL với query parameters
  const getBrandUrl = (brandSlug: string) => {
    const params = new URLSearchParams(location.search);
    params.set("brand", brandSlug);
    return `/products?${params.toString()}`;
  };

  // Hàm tạo logo từ tên brand (lấy 2 chữ cái đầu)
  const getBrandLogo = (name: string): string => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <section id="brands" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-4">
            {t("brands.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            {t("brands.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("brands.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link key={brand.id} to={getBrandUrl(brand.slug)}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center transition-colors flex-shrink-0 overflow-hidden p-1">
                        {brand.thumbnail ? (
                          <div className="w-full h-full rounded-full overflow-hidden">
                            <img
                              src={brand.thumbnail}
                              alt={brand.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                            <span className="text-lg font-bold text-white">
                              {getBrandLogo(brand.name)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {brand.name}
                          </h3>
                          <Award className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {brand.description || ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {brand.productCount} {t("brands.products")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-primary hover:text-primary"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Brands;

