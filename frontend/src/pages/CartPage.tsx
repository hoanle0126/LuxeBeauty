// frontend/src/pages/CartPage.tsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  validatePromotionCode,
  createOrder,
  type ValidatePromotionResponse,
} from "@/lib/api";

const CartPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoading,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] =
    useState<ValidatePromotionResponse | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: t("cart.couponRemoved") || "Đã xóa mã giảm giá",
      description:
        t("cart.couponRemovedDesc") || "Mã giảm giá đã được xóa khỏi đơn hàng",
    });
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const { promotion, discount } = appliedCoupon;
    if (promotion.type === "percentage") {
      return Math.min(discount, promotion.max_discount_amount || Infinity);
    }
    return discount;
  };

  const calculateFinalTotal = () => {
    const discount = calculateDiscount();
    return Math.max(0, totalPrice - discount);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: t("cart.emptyCart") || "Giỏ hàng trống",
        description:
          t("cart.addItemsFirst") ||
          "Vui lòng thêm sản phẩm vào giỏ hàng trước",
        variant: "destructive",
      });
      return;
    }

    // Chuyển hướng đến trang thanh toán
    navigate("/thanh-toan");
  };

  const handleContinueShopping = () => {
    navigate("/san-pham");
  };

  // Reset applied coupon khi giỏ hàng thay đổi
  useEffect(() => {
    if (items.length === 0) {
      setAppliedCoupon(null);
      setCouponCode("");
    }
  }, [items]);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Giỏ hàng - LuxeBeauty</title>
          <meta name="description" content="Giỏ hàng của bạn tại LuxeBeauty" />
        </Helmet>
        <Header />
        <div className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart items skeleton */}
              <div className="lg:w-2/3">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Skeleton className="h-24 w-24 rounded-lg" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              {/* Order summary skeleton */}
              <div className="lg:w-1/3">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Giỏ hàng - LuxeBeauty</title>
          <meta name="description" content="Giỏ hàng của bạn tại LuxeBeauty" />
        </Helmet>
        <Header />
        <div className="min-h-screen bg-background pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-4">
                {t("cart.emptyCart") || "Giỏ hàng trống"}
              </h1>
              <p className="text-muted-foreground mb-8">
                {t("cart.noItems") || "Bạn chưa có sản phẩm nào trong giỏ hàng"}
              </p>
              <Button
                onClick={handleContinueShopping}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("cart.continueShopping") || "Tiếp tục mua sắm"}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const discount = calculateDiscount();
  const finalTotal = calculateFinalTotal();

  return (
    <>
      <Helmet>
        <title>Giỏ hàng - LuxeBeauty</title>
        <meta name="description" content="Giỏ hàng của bạn tại LuxeBeauty" />
      </Helmet>
      <Header />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t("cart.title") || "Giỏ hàng"}
            </h1>
            <p className="text-muted-foreground">
              {t("cart.itemsCount", { count: totalItems }) ||
                `Bạn có ${totalItems} sản phẩm trong giỏ hàng`}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart items */}
            <div className="lg:w-2/3">
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product image */}
                        <Link
                          to={`/san-pham/${item.slug}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>

                        {/* Product details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                to={`/san-pham/${item.slug}`}
                                className="font-medium hover:text-primary transition-colors"
                              >
                                {item.name}
                              </Link>
                              <p className="text-lg font-bold mt-1">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="h-8 w-8"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="h-8 w-8"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {t("cart.subtotal") || "Tạm tính"}
                              </p>
                              <p className="text-lg font-bold">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("cart.continueShopping") || "Tiếp tục mua sắm"}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("cart.clearCart") || "Xóa giỏ hàng"}
                </Button>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("cart.orderSummary") || "Tóm tắt đơn hàng"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("cart.subtotal") || "Tạm tính"}
                      </span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("cart.shipping") || "Phí vận chuyển"}
                      </span>
                      <span>{t("cart.freeShipping") || "Miễn phí"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("cart.tax") || "Thuế"}
                      </span>
                      <span>{formatPrice(0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t("cart.total") || "Tổng cộng"}</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Security badges */}
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Shield className="h-6 w-6 mx-auto mb-1 text-primary" />
                      <p className="text-xs">Bảo mật</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <Truck className="h-6 w-6 mx-auto mb-1 text-primary" />
                      <p className="text-xs">Giao hàng nhanh</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <CreditCard className="h-6 w-6 mx-auto mb-1 text-primary" />
                      <p className="text-xs">Thanh toán an toàn</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleCheckout}
                    className="w-full"
                    size="lg"
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        {t("cart.processing") || "Đang xử lý..."}
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        {t("cart.proceedToCheckout") || "Tiến hành thanh toán"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Additional info */}
              <div className="mt-6 space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">
                      {t("cart.returnPolicy") || "Chính sách đổi trả"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("cart.returnPolicyDesc") ||
                        "Đổi trả trong vòng 30 ngày với điều kiện sản phẩm còn nguyên vẹn"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">
                      {t("cart.needHelp") || "Cần hỗ trợ?"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("cart.contactSupport") ||
                        "Liên hệ hỗ trợ khách hàng: 1800 1234"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
