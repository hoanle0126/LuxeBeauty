import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { forgotPassword, clearAuthError } from "@/stores/auth/action";
import { AppDispatch, RootState } from "@/stores/index";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Lấy state từ Redux store
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  // Track previous loading state để detect khi request hoàn thành
  const [prevLoading, setPrevLoading] = useState(false);

  // Form values type
  type ForgotPasswordFormValues = {
    email: string;
  };

  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  // Xử lý khi forgot password thành công
  useEffect(() => {
    // Detect khi loading chuyển từ true sang false và không có error
    if (prevLoading && !loading && !error) {
      setEmailSent(true);
      toast({
        title: t("auth.resetEmailSent"),
        description: t("auth.checkEmail"),
      });
    }
    setPrevLoading(loading);
  }, [loading, error, prevLoading, toast, t]);

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
        title: t("auth.forgotPasswordTitle"),
        description: errorMessage || t("auth.errorTryAgain") || "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [error, loading, toast, t]);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Clear error và reset emailSent trước khi submit
    dispatch(clearAuthError());
    setEmailSent(false);
    
    try {
      // Dispatch forgot password action - thunk sẽ tự xử lý async
      await dispatch(forgotPassword(data.email));
      // Success sẽ được xử lý trong useEffect
    } catch (error) {
      // Error handling sẽ được xử lý trong useEffect
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center font-serif">
              {t("auth.forgotPasswordTitle")}
            </CardTitle>
            <CardDescription className="text-center">
              {emailSent
                ? t("auth.checkEmail")
                : t("auth.forgotPasswordDesc") || "Nhập email để nhận liên kết đặt lại mật khẩu"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!emailSent ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  autoComplete="off"
                  data-form-type="other"
                >
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t("forgotPassword.emailPlaceholder")}
                            autoComplete="off"
                            data-form-type="other"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("forgotPassword.emailDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        {t("forgotPassword.sending") || "Đang gửi..."}
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        {t("forgotPassword.sendResetEmail") || "Gửi email đặt lại mật khẩu"}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-foreground font-medium">
                    {t("forgotPassword.emailSent")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("forgotPassword.emailSentDesc")}{" "}
                    <span className="font-medium text-foreground">
                      {form.getValues("email")}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("forgotPassword.checkInbox")}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  {t("forgotPassword.resendEmail")}
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Link
              to="/dang-nhap"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("forgotPassword.backToLogin")}
            </Link>

            <div className="w-full border-t border-border pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.noAccount")}{" "}
                <Link
                  to="/dang-ky"
                  className="text-primary hover:underline font-medium"
                >
                  {t("forgotPassword.registerNow")}
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;

