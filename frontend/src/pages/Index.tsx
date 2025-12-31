import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import BrandsSection from '@/components/BrandsSection';
import CategoriesSection from '@/components/CategoriesSection';
import ProductsSection from '@/components/ProductsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>LuxeBeauty - Cửa Hàng Mỹ Phẩm Cao Cấp Hàng Đầu Việt Nam</title>
        <meta 
          name="description" 
          content="Khám phá bộ sưu tập mỹ phẩm cao cấp từ các thương hiệu hàng đầu thế giới. Sản phẩm chính hãng, giao hàng nhanh, ưu đãi hấp dẫn tại LuxeBeauty." 
        />
        <meta name="keywords" content="mỹ phẩm, skincare, makeup, nước hoa, chăm sóc da, trang điểm, Lancôme, Estée Lauder, Dior, Chanel" />
        <link rel="canonical" href="https://luxebeauty.vn" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <BrandsSection />
          <CategoriesSection />
          <ProductsSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
