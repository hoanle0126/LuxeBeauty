import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-cosmetics.jpg';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Luxury cosmetics collection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl animate-fade-in">
          <p className="text-accent font-medium tracking-widest uppercase text-sm mb-4">
            Bộ sưu tập mới 2024
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl font-semibold leading-tight mb-6">
            Khám Phá{' '}
            <span className="italic">Vẻ Đẹp</span>{' '}
            <br className="hidden md:block" />
            Tự Nhiên
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-lg">
            Những sản phẩm chăm sóc da cao cấp từ các thương hiệu hàng đầu thế giới, 
            mang đến vẻ đẹp rạng rỡ cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="elegant" size="xl">
              Khám Phá Ngay
            </Button>
            <Button variant="elegant-outline" size="xl">
              Xem Bộ Sưu Tập
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-foreground/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
