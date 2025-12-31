// frontend/src/pages/OrderConfirmationPage.tsx
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Home, Package, Truck, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const OrderConfirmationPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderNumber) {
      navigate("/");
      return;
    }

    // Hiển thị toast thành công
    toast({
      title: t("checkout.orderSuccess") || "Đặt hàng thành công!",
      description: t("checkout.orderSuccessDesc") || "Cảm ơn bạn đã đặt hàng",
    });
  }, [orderNumber, navigate, toast, t]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Xác nhận đơn hàng - LuxeBeauty</title>
        <meta name="description" content="Xác nhận đơn hàng của bạn tại LuxeBeauty" />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
                <p className="text-muted-foreground mb-4">
                  Cảm ơn bạn đã đặt hàng tại LuxeBeauty. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
                </p>
                <Badge variant="outline" className="mb-6">
                  Mã đơn hàng: {orderNumber}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Order Processing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  Xử lý đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ liên hệ với bạn trong vòng 30 phút để xác nhận.
                </p>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4" />
                  Vận chuyển
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dự kiến giao hàng trong 2-4 giờ tại nội thành Hà Nội, 1-3 ngày với các tỉnh thành khác.
                </p>
              </CardContent>
            </Card>

            {/* Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Theo dõi đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bạn có thể theo dõi trạng thái đơn hàng trong tài khoản của mình hoặc qua email.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Bước tiếp theo</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Xác nhận đơn hàng</p>
                    <p className="text-sm text-muted-foreground">
                      Nhân viên sẽ gọi điện xác nhận đơn hàng với bạn trong vòng 30 phút.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Chuẩn bị & đóng gói</p>
                    <p className="text-sm text-muted-foreground">
                      Sản phẩm sẽ được kiểm tra kỹ lưỡng và đóng gói cẩn thận.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Giao hàng</p>
                    <p className="text-sm text-muted-foreground">
                      Đơn vị vận chuyển sẽ liên hệ với bạn trước khi giao hàng.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Nhận hàng & thanh toán</p>
                    <p className="text-sm text-muted-foreground">
                      Kiểm tra sản phẩm và thanh toán khi nhận hàng (nếu chọn COD).
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Tiếp tục mua sắm
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/tai-khoan/don-hang">
                Xem đơn hàng của tôi
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link to="/ho-tro">
                Cần hỗ trợ?
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;