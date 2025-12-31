import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import BrandsPage from "./pages/BrandsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SupportPage from "./pages/SupportPage";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./contexts/CartContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import SettingsTheme from "./components/SettingsTheme";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import ScrollToTop from "./components/ScrollToTop";
import ScrollToTopButton from "./components/ScrollToTopButton";
import "./i18n";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import EditProduct from "./pages/admin/EditProduct";
import AdminProductDetail from "./pages/admin/AdminProductDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import AddCategory from "./pages/admin/AddCategory";
import EditCategory from "./pages/admin/EditCategory";
import AdminBrands from "./pages/admin/AdminBrands";
import AddBrand from "./pages/admin/AddBrand";
import EditBrand from "./pages/admin/EditBrand";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCustomerDetail from "./pages/admin/AdminCustomerDetail";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminSupportDetail from "./pages/admin/AdminSupportDetail";
import AdminSettings from "./pages/admin/AdminSettings";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <SettingsProvider>
          <SettingsTheme />
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <ScrollToTopButton />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/san-pham" element={<ProductsPage />} />
                      <Route path="/san-pham/:slug" element={<ProductDetail />} />
                      <Route path="/thuong-hieu" element={<BrandsPage />} />
                      <Route path="/danh-muc" element={<CategoriesPage />} />
                      <Route path="/ho-tro" element={<SupportPage />} />
                      <Route path="/gio-hang" element={<CartPage />} />
                      <Route path="/thanh-toan" element={<CheckoutPage />} />
                      <Route path="/xac-nhan-don-hang" element={<OrderConfirmationPage />} />
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/products/add" element={<AddProduct />} />
                      <Route path="/admin/products/:slug/edit" element={<EditProduct />} />
                      <Route path="/admin/products/:slug" element={<AdminProductDetail />} />
                      <Route path="/admin/categories" element={<AdminCategories />} />
                      <Route path="/admin/categories/add" element={<AddCategory />} />
                      <Route path="/admin/categories/:slug/edit" element={<EditCategory />} />
                      <Route path="/admin/brands" element={<AdminBrands />} />
                      <Route path="/admin/brands/add" element={<AddBrand />} />
                      <Route path="/admin/brands/:slug/edit" element={<EditBrand />} />
                      <Route path="/admin/promotions" element={<AdminPromotions />} />
                      <Route path="/admin/customers" element={<AdminCustomers />} />
                      <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />
                      <Route path="/admin/support" element={<AdminSupport />} />
                      <Route path="/admin/support/:id" element={<AdminSupportDetail />} />
                      <Route path="/admin/settings" element={<AdminSettings />} />
                      
                      {/* Auth Route */}
                      <Route path="/dang-nhap" element={<LoginPage />} />
                      <Route path="/dang-ky" element={<RegisterPage />} />
                      <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
                      <Route path="/reset-mat-khau" element={<ResetPasswordPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </SettingsProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
