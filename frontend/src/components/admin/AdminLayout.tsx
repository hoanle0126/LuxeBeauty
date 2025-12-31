import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  FolderTree,
  MessageSquare,
  Award,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NotificationDrawer from "@/components/admin/NotificationDrawer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Initialize sidebar state based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Check screen size on initial render
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // md breakpoint
    }
    return true; // Default to open if SSR
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Set default sidebar state based on screen size on mount (F5/reload)
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      // Desktop (>md): open by default
      // Mobile (<md): closed by default
      setIsSidebarOpen(isDesktop);
    };

    // Check on mount
    checkScreenSize();
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: t("admin.dashboard"), href: "/admin" },
    { icon: ShoppingCart, label: t("admin.orders"), href: "/admin/orders" },
    { icon: Package, label: t("admin.products"), href: "/admin/products" },
    { icon: FolderTree, label: t("admin.categories"), href: "/admin/categories" },
    { icon: Award, label: t("admin.brands"), href: "/admin/brands" },
    { icon: Tag, label: t("admin.promotions"), href: "/admin/promotions" },
    { icon: Users, label: t("admin.customers"), href: "/admin/customers" },
    { icon: MessageSquare, label: t("admin.support"), href: "/admin/support" },
  ];

  const handleLogout = () => {
    logout();
    toast({
      title: t("common.logout"),
      description: i18n.language === "vi" ? "Hẹn gặp lại bạn!" : "See you again!",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-card border-r border-border",
          // Mobile: đóng hoàn toàn (ẩn), mở full width
          isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full",
          // Desktop: luôn hiển thị, thu gọn hoặc mở rộng
          "lg:translate-x-0",
          isSidebarOpen ? "lg:w-64" : "lg:w-20"
        )}
      >
        <div className={cn(
          "flex flex-col h-full overflow-hidden transition-opacity duration-300",
          // Ẩn content trên mobile khi sidebar đóng
          !isSidebarOpen && "lg:opacity-100 opacity-0"
        )}>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
            <Link
              to="/admin"
              className={cn(
                "font-bold text-primary font-serif transition-all whitespace-nowrap",
                isSidebarOpen ? "text-xl" : "lg:text-lg text-xl"
              )}
            >
              {isSidebarOpen ? (
                "Bella Admin"
              ) : (
                <span className="hidden lg:inline">BA</span>
              )}
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-foreground hover:bg-accent",
                        !isSidebarOpen && "lg:justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className={cn(
                        "font-medium transition-all",
                        !isSidebarOpen && "lg:hidden"
                      )}>
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info */}
          {user && (
            <div className={cn(
              "p-4 border-t border-border transition-all",
              !isSidebarOpen && "lg:hidden"
            )}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.role === "admin" ? "Quản trị viên" : "User"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          // Mobile: không có margin (sidebar overlay)
          // Desktop: có margin tùy theo sidebar mở/đóng
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Search */}
              <div className="hidden md:flex items-center max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("common.search") + "..."}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notifications */}
              <NotificationDrawer />

              {/* Settings */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin/settings")}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.fullName} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.fullName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{t("admin.myAccount")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/")}>
                    {t("admin.backToHome")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

