import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearAuthError } from "@/stores/auth/action";
import { AppDispatch, RootState } from "@/stores/index";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
  // Lấy state từ Redux store
  const { loading, error } = useSelector((state: RootState) => state.auth);

  // Lấy token và email từ URL query params
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Form values type
  type ResetPasswordFormValues = {
    email: string;
    token: string;
    password: string;
    confirmPassword: string;
  };

  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      email: email || "",
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Track previous loading state để detect khi request hoàn thành
  const [prevLoading, setPrevLoading] = useState(false);

  // Navigate khi reset password thành công
  useEffect(() => {
    // Detect khi loading chuyển từ true sang false và không có error
    if (prevLoading && !loading && !error) {
      const timer = setTimeout(() => {
        toast({
          title: t("auth.resetPasswordSuccess") || "Đặt lại mật khẩu thành công!",
          description: t("auth.resetPasswordSuccessDesc") || "Vui lòng đăng nhập với mật khẩu mới.",
        });
        
        // Navigate về trang login sau khi reset password thành công
        navigate("/dang-nhap");
      }, 100);
      
      return () => clearTimeout(timer);
    }
    setPrevLoading(loading);
  }, [loading, error, prevLoading, navigate, toast, t]);

  // Hiển thị error nếu có (từ backend)
  useEffect(() => {
    if (error && !loading) {
      // Error có thể là string hoặc object với validation errors
      let errorMessage: string = "";
      if (typeof error === "object" && error !== null) {
        // Laravel validation errors format: { field: ["message1", "message2"] }
        const errorMessages = Object.values(error).flat() as string[];
        // Chỉ lấy error message đầu tiên
        errorMessage = errorMessages[0] || t("auth.errorTryAgain") || "Có lỗi xảy ra, vui lòng thử lại.";
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      // Cắt ngắn nếu quá dài (giới hạn 100 ký tự)
      if (errorMessage.length > 100) {
        errorMessage = errorMessage.substring(0, 100) + "...";
      }
      
      toast({
        title: t("auth.resetPasswordFailed") || "Đặt lại mật khẩu thất bại!",
        description: errorMessage || t("auth.errorTryAgain") || "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [error, loading, toast, t]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    // Clear error trước khi submit
    dispatch(clearAuthError());
    
    try {
      // Dispatch reset password action - tất cả validation sẽ được xử lý bởi backend
      await dispatch(resetPassword(
        data.email,
        data.token,
        data.password,
        data.confirmPassword
      ));
      // Success sẽ được xử lý trong useEffect
    } catch (error) {
      // Error handling sẽ được xử lý trong useEffect
    }
  };

  // Kiểm tra nếu thiếu token hoặc email
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center font-serif">
                {t("auth.resetPasswordTitle") || "Đặt lại mật khẩu"}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.invalidResetLink") || "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link to="/quen-mat-khau" className="text-primary hover:underline font-medium">
                {t("auth.requestNewLink") || "Yêu cầu link mới"}
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center font-serif">
              {t("auth.resetPasswordTitle") || "Đặt lại mật khẩu"}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.resetPasswordDesc") || "Nhập mật khẩu mới của bạn"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="space-y-4"
                autoComplete="off"
                data-form-type="other"
              >
                {/* Email Field (hidden, auto-filled from URL) */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          autoComplete="off"
                          data-form-type="other"
                          disabled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Token Field (hidden) */}
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <input type="hidden" {...field} />
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            data-form-type="other"
                            data-lpignore="true"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            data-form-type="other"
                            data-lpignore="true"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t("resetPassword.processing") || "Đang xử lý..."}
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      {t("resetPassword.submit") || "Đặt lại mật khẩu"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link
              to="/dang-nhap"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("resetPassword.backToLogin") || "Quay lại đăng nhập"}
            </Link>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;

