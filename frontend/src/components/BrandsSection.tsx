import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/axios/axiosClient";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Interface cho brand từ backend
interface Brand {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  status: "active" | "inactive";
  description?: string;
  thumbnail?: string;
}

// Interface cho API response
interface ApiResponse<T> {
  data: T;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
  success?: boolean;
  message?: string;
}

// Hàm fetch brands có nhiều sản phẩm nhất
const fetchTopBrands = async (): Promise<Brand[]> => {
  try {
    const response = await axiosClient.get<ApiResponse<Brand[]>>(
      `/brands?per_page=6&sort_field=product_count&sort_order=desc&status=active`
    );
    const dataArray = response.data?.data || [];
    
    return dataArray.map((brand: any) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand.productCount || 0,
      status: brand.status || "active",
      description: brand.description,
      thumbnail: brand.thumbnail,
    }));
  } catch (error) {
    console.error("Error fetching top brands:", error);
    return [];
  }
};

const BrandsSection = () => {
  // Sử dụng React Query để fetch brands
  const { data: brands = [], isLoading, error } = useQuery<Brand[]>({
    queryKey: ["topBrands"],
    queryFn: fetchTopBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Lấy 2 chữ cái đầu của tên brand cho logo
  const getBrandLogo = (brandName: string): string => {
    const words = brandName.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return brandName.substring(0, 2).toUpperCase();
  };

  // Hiển thị loading state
  if (isLoading) {
    return (
      <section id="brands" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-4 w-32 mx-auto mb-3" />
            <Skeleton className="h-10 w-64 mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-8 bg-card rounded-lg border border-border/50"
              >
                <div className="text-center w-full">
                  <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                  <Skeleton className="h-4 w-20 mx-auto mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <section id="brands" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
              Được tin tưởng bởi
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Thương Hiệu Hàng Đầu
            </h2>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Không thể tải danh sách thương hiệu. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Hiển thị empty state
  if (brands.length === 0) {
    return (
      <section id="brands" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
              Được tin tưởng bởi
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Thương Hiệu Hàng Đầu
            </h2>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Chưa có thương hiệu nào được thêm vào hệ thống.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="brands" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-3">
            Được tin tưởng bởi
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">
            Thương Hiệu Hàng Đầu
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {brands.length} thương hiệu có nhiều sản phẩm nhất trong hệ thống
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {brands.map((brand, index) => (
            <div
              key={brand.id}
              className={cn(
                "group flex items-center justify-center p-8 bg-card rounded-lg border border-border/50",
                "hover:border-accent/30 hover:shadow-elegant transition-all duration-300 cursor-pointer",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className="text-3xl font-serif font-bold text-muted-foreground group-hover:text-accent transition-colors duration-300">
                  {getBrandLogo(brand.name)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {brand.name}
                </p>
                <div className="mt-1 text-xs text-muted-foreground/70">
                  {brand.productCount} sản phẩm
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;