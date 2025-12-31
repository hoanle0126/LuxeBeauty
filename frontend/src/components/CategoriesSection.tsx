import { ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const CategoriesSection = () => {
  // Fetch categories từ backend sử dụng React Query
  const { data: categories = [], isLoading, error } = useCategories();

  // Sắp xếp categories theo productCount giảm dần và lấy 8 categories đầu tiên
  const topCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    
    // Sắp xếp theo productCount giảm dần
    const sorted = [...categories].sort((a, b) => {
      const countA = a.productCount || 0;
      const countB = b.productCount || 0;
      return countB - countA; // Giảm dần
    });
    
    // Lấy 8 categories đầu tiên
    return sorted.slice(0, 8);
  }, [categories]);

  // Fallback data nếu có lỗi hoặc đang loading
  const displayCategories = isLoading || error ? [] : topCategories;

  return (
    <section id="categories" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
            Khám phá
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">
            Danh Mục Sản Phẩm Nổi Bật
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Khám phá 8 danh mục có nhiều sản phẩm nhất
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-xl aspect-[3/4] bg-card"
              >
                <Skeleton className="absolute inset-0 w-full h-full" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.
            </p>
          </div>
        )}

        {/* Success state */}
        {!isLoading && !error && displayCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCategories.map((category, index) => (
              <a
                key={category.id}
                href={`/products?category=${category.name}`}
                className={cn(
                  "group relative overflow-hidden rounded-xl aspect-[3/4] card-hover",
                  "transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="absolute inset-0 image-zoom">
                  <img
                    src={category.thumbnail || 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b8a?w=800&q=80'}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm opacity-80">
                      {category.productCount || 0} sản phẩm
                    </p>
                    {index < 3 && (
                      <span className="text-xs bg-primary/20 text-primary-foreground px-2 py-1 rounded-full">
                        Top {index + 1}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl font-semibold mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm opacity-80 mb-4">
                    {category.description || 'Sản phẩm chất lượng cao'}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Xem ngay <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && displayCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Hiện chưa có danh mục sản phẩm nào.
            </p>
          </div>
        )}

        {/* Xem tất cả categories button */}
        {!isLoading && !error && categories.length > 8 && (
          <div className="text-center mt-12">
            <a
              href="/products"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium transition-colors"
            >
              Xem tất cả {categories.length} danh mục
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;