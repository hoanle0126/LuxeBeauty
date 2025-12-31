import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold mb-3">
              Đăng Ký Nhận Ưu Đãi
            </h3>
            <p className="text-primary-foreground/70 mb-6">
              Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên và cập nhật những xu hướng làm đẹp mới nhất.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Email của bạn"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-accent"
              />
              <Button variant="rose" size="lg" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <a href="#" className="font-serif text-2xl font-semibold inline-block mb-4">
              <span className="text-primary-foreground">Luxe</span>
              <span className="text-accent">Beauty</span>
            </a>
            <p className="text-primary-foreground/70 text-sm mb-6">
              Cửa hàng mỹ phẩm cao cấp hàng đầu Việt Nam với các sản phẩm chính hãng từ các thương hiệu nổi tiếng thế giới.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Liên Kết Nhanh</h4>
            <ul className="space-y-3">
              {['Trang Chủ', 'Sản Phẩm', 'Thương Hiệu', 'Khuyến Mãi', 'Blog'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Danh Mục</h4>
            <ul className="space-y-3">
              {['Chăm Sóc Da', 'Trang Điểm', 'Nước Hoa', 'Chăm Sóc Tóc', 'Chăm Sóc Cơ Thể'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Liên Hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  123 Đường Nguyễn Huệ, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  1900 1234
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  contact@luxebeauty.vn
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/50">
            <p>© 2024 LuxeBeauty. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-accent transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-accent transition-colors">Điều khoản sử dụng</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
