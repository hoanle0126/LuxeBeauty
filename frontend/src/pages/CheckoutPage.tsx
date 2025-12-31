// frontend/src/pages/CheckoutPage.tsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Truck,
  Shield,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Home,
  Building,
  Package,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  validatePromotionCode,
  createOrder,
  type ValidatePromotionResponse,
  type CreateOrderRequest,
} from "@/lib/api";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    items,
    totalItems,
    totalPrice,
    isLoading: cartLoading,
    clearCart,
  } = useCart();

  // Form states
  const [shippingName, setShippingName] = useState(user?.name || "");
  const [shippingPhone, setShippingPhone] = useState(user?.phone || "");
  const [shippingEmail, setShippingEmail] = useState(user?.email || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [shippingWard, setShippingWard] = useState("");
  const [notes, setNotes] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<ValidatePromotionResponse | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Shipping fee
  const shippingFee = 30000; // 30,000 VND default

  // Calculate totals
  const discountAmount = appliedCoupon
    ? appliedCoupon.promotion.type === "percentage"
      ? (totalPrice * appliedCoupon.promotion.value) / 100
      : appliedCoupon.promotion.value
    : 0;

  const subtotal = totalPrice;
  const total = subtotal + shippingFee - discountAmount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: t("cart.invalidCoupon") || "Mã giảm giá không hợp lệ",
        description: t("cart.enterCouponCode") || "Vui lòng nhập mã giảm giá",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const validationResult = await validatePromotionCode(
        couponCode.trim().toUpperCase(),
        totalPrice
      );
      setAppliedCoupon(validationResult);

      toast({
        title: t("cart.couponApplied") || "Áp dụng mã giảm giá thành công",
        description:
          validationResult.promotion.type === "percentage"
            ? `Giảm ${validationResult.promotion.value}% đã được áp dụng`
            : `Giảm ${formatPrice(
                validationResult.promotion.value
              )} đã được áp dụng`,
      });
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      const errorMessage =
        error?.response?.data?.message ||
        t("cart.invalidCoupon") ||
        "Mã giảm giá không hợp lệ hoặc đã hết hạn";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: t("cart.couponRemoved") || "Đã xóa mã giảm giá",
      description: t("cart.couponRemovedDesc") || "Mã giảm giá đã được xóa",
    });
  };

  const validateForm = () => {
    if (!shippingName.trim()) {
      toast({
        title: t("checkout.validationError") || "Thiếu thông tin",
        description: t("checkout.nameRequired") || "Vui lòng nhập họ tên",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingPhone.trim()) {
      toast({
        title: t("checkout.validationError") || "Thiếu thông tin",
        description:
          t("checkout.phoneRequired") || "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingEmail.trim()) {
      toast({
        title: t("checkout.validationError") || "Thiếu thông tin",
        description: t("checkout.emailRequired") || "Vui lòng nhập email",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingAddress.trim()) {
      toast({
        title: t("checkout.validationError") || "Thiếu thông tin",
        description: t("checkout.addressRequired") || "Vui lòng nhập địa chỉ",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingCity.trim()) {
      toast({
        title: t("checkout.validationError") || "Thiếu thông tin",
        description:
          t("checkout.cityRequired") || "Vui lòng nhập thành phố/tỉnh",
        variant: "destructive",
      });
      return false;
    }

    if (!shippingDistrict.trim()) {
      toast({
        title: t("checkout.validationError") || "Thiếu thông tin",
        description:
          t("checkout.districtRequired") || "Vui lòng nhập quận/huyện",
        variant: "destructive",
      });
      return false;
    }

    if (items.length === 0) {
      toast({
        title: t("checkout.emptyCart") || "Giỏ hàng trống",
        description:
          t("checkout.addItemsFirst") ||
          "Vui lòng thêm sản phẩm vào giỏ hàng trước",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsPlacingOrder(true);
    try {
      const orderData: CreateOrderRequest = {
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_email: shippingEmail,
        shipping_address: `${shippingAddress}, ${shippingWard}, ${shippingDistrict}, ${shippingCity}`,
        payment_method: paymentMethod,
        notes: notes || undefined,
        shipping_fee: shippingFee,
        promotion_code: appliedCoupon?.promotion.code || undefined,
        discount: discountAmount,
      };

      const order = await createOrder(orderData);

      // Clear cart after successful order
      await clearCart();

      toast({
        title: t("checkout.orderSuccess") || "Đặt hàng thành công",
        description:
          t("checkout.orderSuccessDesc") || "Cảm ơn bạn đã đặt hàng!",
      });

      // Navigate to order confirmation page
      navigate(`/don-hang/${order.orderNumber}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      const errorMessage =
        error?.response?.data?.message ||
        t("checkout.orderError") ||
        "Có lỗi xảy ra khi đặt hàng";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setShippingName(user.name || "");
      setShippingPhone(user.phone || "");
      setShippingEmail(user.email || "");
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate("/gio-hang");
    }
  }, [cartLoading, items, navigate]);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Thanh toán - LuxeBeauty</title>
        <meta
          name="description"
          content="Hoàn tất thanh toán đơn hàng của bạn tại LuxeBeauty"
        />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              to="/gio-hang"
              className="hover:text-foreground transition-colors"
            >
              Giỏ hàng
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Thanh toán</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back to Cart */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="pl-0 hover:pl-2 transition-all"
                onClick={() => navigate("/gio-hang")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại giỏ hàng
              </Button>
            </div>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Thông tin giao hàng
                </CardTitle>
                <CardDescription>
                  Vui lòng nhập đầy đủ thông tin để chúng tôi có thể giao hàng
                  cho bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline h-4 w-4 mr-1" />
                      Họ và tên *
                    </Label>
                    <Input
                      id="name"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Số điện thoại *
                    </Label>
                    <Input
                      id="phone"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="0987654321"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    placeholder="example@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <Home className="inline h-4 w-4 mr-1" />
                    Địa chỉ cụ thể *
                  </Label>
                  <Input
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, tên đường"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Thành phố/Tỉnh *</Label>
                    <Input
                      id="city"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="Hà Nội"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện *</Label>
                    <Input
                      id="district"
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      placeholder="Quận Cầu Giấy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ward">Phường/Xã</Label>
                    <Input
                      id="ward"
                      value={shippingWard}
                      onChange={(e) => setShippingWard(e.target.value)}
                      placeholder="Phường Dịch Vọng"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú đơn hàng</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi điện trước khi giao..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
                <CardDescription>
                  Chọn phương thức thanh toán phù hợp với bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <div className="flex-1">
                      <Label
                        htmlFor="cod"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Wallet className="h-4 w-4" />
                        Thanh toán khi nhận hàng (COD)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Thanh toán bằng tiền mặt khi nhận được hàng
                      </p>
                    </div>
                    <Badge variant="outline">Phổ biến</Badge>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <div className="flex-1">
                      <Label
                        htmlFor="bank_transfer"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Building className="h-4 w-4" />
                        Chuyển khoản ngân hàng
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Chuyển khoản trước qua ngân hàng
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors opacity-50">
                    <RadioGroupItem value="momo" id="momo" disabled />
                    <div className="flex-1">
                      <Label
                        htmlFor="momo"
                        className="flex items-center gap-2 cursor-not-allowed"
                      >
                        <CreditCard className="h-4 w-4" />
                        Ví MoMo
                      </Label>{" "}
                      <p className="text-sm text-muted-foreground mt-1">
                        Thanh toán qua ví điện tử MoMo (sắp có)
                      </p>
                    </div>
                    <Badge variant="secondary">Sắp có</Badge>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Security Assurance */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Bảo mật & Bảo hành
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Thông tin thanh toán được bảo mật 100%
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Đổi trả trong 30 ngày nếu sản phẩm lỗi
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Hỗ trợ khách hàng 24/7
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Giao hàng nhanh trong 2-4 giờ tại nội thành
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Sản phẩm ({totalItems})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-muted-foreground/10">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Coupon Code */}
                <div className="space-y-3">
                  <h4 className="font-medium">Mã giảm giá</h4>
                  {appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-300">
                            {appliedCoupon.promotion.code}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {appliedCoupon.promotion.type === "percentage"
                              ? `Giảm ${appliedCoupon.promotion.value}%`
                              : `Giảm ${formatPrice(
                                  appliedCoupon.promotion.value
                                )}`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã giảm giá"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        variant="outline"
                      >
                        {isApplyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Phí vận chuyển
                    </span>
                    <span>{formatPrice(shippingFee)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col space-y-4">
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || items.length === 0}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isPlacingOrder ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Đặt hàng
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Bằng cách nhấn "Đặt hàng", bạn đồng ý với{" "}
                  <Link
                    to="/dieu-khoan"
                    className="text-primary hover:underline"
                  >
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/chinh-sach"
                    className="text-primary hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>{" "}
                  của chúng tôi
                </p>
              </CardFooter>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4" />
                  Thông tin giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">1</span>
                    </div>
                    <span>
                      Giao hàng nhanh trong 2-4 giờ tại nội thành Hà Nội
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">2</span>
                    </div>
                    <span>Giao hàng 1-3 ngày với các tỉnh thành khác</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">3</span>
                    </div>
                    <span>Miễn phí vận chuyển cho đơn hàng từ 500.000đ</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h4 className="font-medium mb-2">Cần hỗ trợ?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Liên hệ với chúng tôi nếu bạn cần hỗ trợ
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link to="/ho-tro">
                        <Phone className="mr-2 h-4 w-4" />
                        Hotline: 1900 1234
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link to="/ho-tro">
                        <Mail className="mr-2 h-4 w-4" />
                        Email hỗ trợ
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
