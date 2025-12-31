import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LogIn } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/stores/auth/action";
import { AppDispatch, RootState } from "@/stores/index";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTitle from "@/components/PageTitle";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
  // Lấy state từ Redux store
  const { loading, user, error } = useSelector((state: RootState) => state.auth);

  // Form values type
  type LoginFormValues = {
    email: string;
    password: string;
    rememberMe: boolean;
  };

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Navigate khi login thành công
  useEffect(() => {
    if (user && !loading) {
      // Delay một chút để đảm bảo state đã được cập nhật
      const timer = setTimeout(() => {
      toast({
        title: t("auth.loginSuccess") || "Đăng nhập thành công!",
        description: t("auth.welcomeBack") || "Chào mừng bạn quay trở lại.",
      });
      
        // Check role để navigate
        const userRoles = user.roles || [];
        if (userRoles.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/");
      }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate, toast, t]);

  // Hiển thị error nếu có (từ backend)
  useEffect(() => {
    if (error && !loading) {
      // Error có thể là string hoặc object với validation errors
      let errorMessage: string = "";
      if (typeof error === "object" && error !== null) {
        // Laravel validation errors format: { field: ["message1", "message2"] }
        const errorMessages = Object.values(error).flat();
        // Chỉ lấy error message đầu tiên
        errorMessage = errorMessages[0] || t("auth.invalidCredentials") || "Email hoặc mật khẩu không chính xác.";
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      
      // Cắt ngắn nếu quá dài (giới hạn 100 ký tự)
      if (errorMessage.length > 100) {
        errorMessage = errorMessage.substring(0, 100) + "...";
      }
      
      toast({
        title: t("auth.loginFailed") || "Đăng nhập thất bại!",
        description: errorMessage || t("auth.invalidCredentials") || "Email hoặc mật khẩu không chính xác.",
        variant: "destructive",
      });
    }
  }, [error, loading, toast, t]);

  const onSubmit = (data: LoginFormValues) => {
    // Dispatch login action - thunk sẽ tự xử lý async
    dispatch(login(data.email, data.password, data.rememberMe));
    // Navigation và error handling sẽ được xử lý trong useEffect
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageTitle titleKey="login" />
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center font-serif">
              {t("auth.loginTitle")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.loginDesc") || "Nhập email và mật khẩu để đăng nhập vào tài khoản"}
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
                          placeholder={t("auth.emailPlaceholder")}
                          autoComplete="off"
                          data-form-type="other"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
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
                            autoComplete="off"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {t("auth.rememberMe")}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <Link
                    to="/quen-mat-khau"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t("common.loading") || "Đang xử lý..."}
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      {t("common.login") || "Đăng nhập"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <Link to="/dang-ky" className="text-primary hover:underline font-medium">
                {t("auth.registerNow")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;

