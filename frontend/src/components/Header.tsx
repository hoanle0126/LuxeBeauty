// ... existing imports ...
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  User,
  Heart,
  Search,
  LogOut,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SearchCommand from "@/components/SearchCommand";
import { useCart } from "@/contexts/CartContext";
import UserMenu from "./UserMenu";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart(); // Lấy số lượng sản phẩm trong giỏ hàng
  const { isAuthenticated } = useAuth();

  // TODO: Thay thế bằng authentication context khi có backend
  const [isAdmin] = useState(false); // Tạm thời hardcode, sẽ thay bằng context
  const [isLoggedIn] = useState(false); // Tạm thời hardcode, sẽ thay bằng context
  const [userName] = useState("Người dùng"); // Tạm thời hardcode
  const [userEmail] = useState("user@example.com"); // Tạm thời hardcode

  const navLinks = [
    { name: "Trang Chủ", href: "/" },
    { name: "Sản Phẩm", href: "/san-pham" },
    { name: "Thương Hiệu", href: "/thuong-hieu" },
    { name: "Danh Mục", href: "/danh-muc" },
    { name: "Hỗ trợ", href: "/ho-tro" },
  ];

  const handleLogout = () => {
    // TODO: Implement logout logic khi có authentication
    console.log("Logout clicked");
    // navigate("/dang-nhap");
  };

  const handleProfile = () => {
    // TODO: Navigate to profile page khi có
    console.log("Profile clicked");
    // navigate("/thong-tin-ca-nhan");
  };

  const handleDashboard = () => {
    // TODO: Navigate to admin dashboard
    console.log("Dashboard clicked");
    // navigate("/admin/dashboard");
  };

  const handleUserClick = () => {
    if (!isLoggedIn) {
      navigate("/dang-nhap");
    }
    // Nếu đã đăng nhập, dropdown sẽ tự động mở khi click (DropdownMenuTrigger)
  };

  // Hàm lấy chữ cái đầu từ tên người dùng để hiển thị trên avatar
  const getUserInitials = () => {
    if (!userName) return "U";
    return userName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        {/* Main navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            to="/"
            className="font-serif text-2xl md:text-3xl font-semibold tracking-tight"
          >
            <span className="text-foreground">Luxe</span>
            <span className="text-primary">Beauty</span>{" "}
            {/* Đổi từ text-accent sang text-primary */}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  location.pathname === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    location.pathname === link.href
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <SearchCommand />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/gio-hang")}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {totalItems || 0}
              </span>
            </Button>
            {/* User Section */}
            {isAuthenticated ? (
              // Đã đăng nhập: Hiển thị Avatar với Dropdown Menu
              <UserMenu />
            ) : (
              // Chưa đăng nhập: Hiển thị User icon, click sẽ điều hướng đến trang đăng nhập
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dang-nhap">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container mx-auto px-4 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`block text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
