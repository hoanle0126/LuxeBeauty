import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id?: number;
  slug?: string;
  image: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
}

const ProductCard = ({ id, slug, image, name, category, price, originalPrice }: ProductCardProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [isCardHovered, setIsCardHovered] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id && slug) {
      await addItem({ id, slug, name, image, price });
      // Toast sẽ được hiển thị trong CartContext
    }
  };

  const showCardHoverEffects = isCardHovered;

  const cardContent = (
    <Card 
      className={cn(
        "group overflow-hidden border-0 shadow-md transition-all duration-300",
        showCardHoverEffects && "shadow-xl"
      )}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            showCardHoverEffects && "scale-110"
          )}
        />
        {originalPrice && (
          <span className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium z-10">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        )}
        <div className={cn(
          "absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 bg-gradient-to-t from-background/80 to-transparent z-10",
          showCardHoverEffects ? "opacity-100" : "opacity-0"
        )}>
          <Button className="w-full gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            {t("productCard.addToCart")}
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground mb-1">{category}</p>
        <h3 className={cn(
          "font-semibold text-foreground mb-2 transition-colors line-clamp-2",
          showCardHoverEffects && "text-primary"
        )}>
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (slug) {
    return <Link to={`/product/${slug}`}>{cardContent}</Link>;
  }

  return cardContent;
};

export default ProductCard;
