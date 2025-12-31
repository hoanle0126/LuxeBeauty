import ProductCard from "./ProductCard";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/api";

interface FeaturedProductsProps {
  products?: Product[];
  isLoading?: boolean;
}

const FeaturedProducts = ({ products = [], isLoading = false }: FeaturedProductsProps) => {
  const { t } = useTranslation();
  
  return (
    <section id="products" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium mb-4">
            {t("featuredProducts.title")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
            {t("featuredProducts.subtitle")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("featuredProducts.subtitle")}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                image={product.image || (product.images && product.images[0]) || ""}
                name={product.name}
                category={product.category || ""}
                price={product.price}
                originalPrice={product.originalPrice || undefined}
              />
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

export default FeaturedProducts;
