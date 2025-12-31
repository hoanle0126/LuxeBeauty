import { FolderTree, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Category } from "@/lib/api";

interface CategoriesProps {
  categories?: Category[];
  isLoading?: boolean;
}

const Categories = ({ categories = [], isLoading = false }: CategoriesProps) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Hàm tạo URL với query parameters
  const getCategoryUrl = (categorySlug: string) => {
    const params = new URLSearchParams(location.search);
    params.set("category", categorySlug);
    return `/products?${params.toString()}`;
  };

  return (
    <section id="categories" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-4">
            {t("categories.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            {t("categories.title")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("categories.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {categories.map((category) => {
                return (
                  <CarouselItem
                    key={category.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                  >
                    <Link to={getCategoryUrl(category.slug)}>
                      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center transition-colors overflow-hidden p-1">
                              {category.thumbnail ? (
                                <div className="w-full h-full rounded-full overflow-hidden">
                                  <img
                                    src={category.thumbnail}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                                  <FolderTree className="w-4 h-4 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {category.description || ""}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {category.productCount} {t("categories.products")}
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
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="left-0 md:-left-12" />
            <CarouselNext className="right-0 md:-right-12" />
          </Carousel>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("common.noData")}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;

