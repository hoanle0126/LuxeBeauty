import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedProducts } from '@/hooks/useApi';
import { addToCart } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const ProductsSection = () => {
  const { toast } = useToast();
  const { data: products = [], isLoading, error } = useFeaturedProducts();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const handleAddToCart = async (productId: number) => {
    try {
      setAddingToCart(productId);
      await addToCart(productId, 1);
      toast({
        title: "Thành công",
        description: "Sản phẩm đã được thêm vào giỏ hàng",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm sản phẩm vào giỏ hàng",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <section id="products" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
                Bán chạy nhất
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                Sản Phẩm Nổi Bật
              </h2>
            </div>
            <Button variant="elegant-outline">
              Xem Tất Cả
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="group bg-card rounded-xl overflow-hidden border border-border/50"
              >
                <div className="relative aspect-square overflow-hidden bg-secondary/50">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Handle error state
  if (error) {
    return (
      <section id="products" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
                Bán chạy nhất
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                Sản Phẩm Nổi Bật
              </h2>
            </div>
            <Button variant="elegant-outline">
              Xem Tất Cả
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Không thể tải sản phẩm. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Handle empty state
  if (products.length === 0) {
    return (
      <section id="products" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
                Bán chạy nhất
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">
                Sản Phẩm Nổi Bật
              </h2>
            </div>
            <Button variant="elegant-outline">
              Xem Tất Cả
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Hiện chưa có sản phẩm nổi bật.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
              Bán chạy nhất
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Sản Phẩm Nổi Bật
            </h2>
          </div>
          <Button variant="elegant-outline">
            Xem Tất Cả
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group bg-card rounded-xl overflow-hidden border border-border/50 card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-secondary/50">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="text-muted-foreground">No image</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {/* Note: Backend doesn't provide isNew/isSale flags yet */}
                  {/* We can add logic based on createdAt or other fields */}
                  {product.createdAt && new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                      Mới
                    </span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                      Sale
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <Button variant="secondary" size="icon" className="w-9 h-9 rounded-full shadow-soft">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                {/* Add to Cart */}
                <div className="absolute bottom-3 left-3 right-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Button 
                    variant="default" 
                    className="w-full gap-2 rounded-full shadow-elegant"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingToCart === product.id}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {addingToCart === product.id ? 'Đang thêm...' : 'Thêm vào giỏ'}
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{product.brand || 'Unknown brand'}</p>
                <h3 className="font-medium text-foreground mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h3>
                
                {/* Rating */}
                {/* Note: Backend doesn't provide rating/reviews yet */}
                {/* We can add this when backend supports it */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-muted text-muted"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (0)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;