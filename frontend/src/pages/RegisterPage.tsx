import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, UserPlus } from "lucide-react";
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
import { register, clearAuthError } from "@/stores/auth/action";
import { AppDispatch, RootState } from "@/stores/index";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTitle from "@/components/PageTitle";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  
  // Lấy state từ Redux store
  const { loading, user, error } = useSelector((state: RootState) => state.auth);

  // Form values type
  type RegisterFormValues = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  };

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  // Navigate khi register thành công
  useEffect(() => {
    if (user && !loading) {
      // Delay một chút để đảm bảo state đã được cập nhật
      const timer = setTimeout(() => {
        toast({
          title: t("auth.registerSuccess") || "Đăng ký thành công!",
          description: t("auth.welcomeMessage") || "Chào mừng bạn đến với Bella Beauty.",
        });
        
        // Navigate về trang chủ sau khi đăng ký
        navigate("/");
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
        title: t("auth.registerFailed") || "Đăng ký thất bại!",
        description: errorMessage || t("auth.errorTryAgain") || "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [error, loading, toast, t]);

  const onSubmit = async (data: RegisterFormValues) => {
    // Clear error trước khi submit
    dispatch(clearAuthError());
    
    try {
      // Dispatch register action - tất cả validation (bao gồm agreeToTerms) sẽ được xử lý bởi backend
      await dispatch(register(
        data.fullName, 
        data.email, 
        data.phone, 
        data.password,
        data.confirmPassword,
        data.agreeToTerms
      ));
      // Navigation sẽ được xử lý trong useEffect khi user được set
    } catch (error) {
      // Error handling sẽ được xử lý trong useEffect
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageTitle titleKey="register" />
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center font-serif">
              {t("auth.registerTitle")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.registerDesc") || "Tạo tài khoản mới để trải nghiệm mua sắm tuyệt vời"}
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
                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.fullName")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t("register.fullNamePlaceholder")}
                          autoComplete="off"
                          data-form-type="other"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder={t("register.emailPlaceholder")}
                          autoComplete="off"
                          data-form-type="other"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.phone")}</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder={t("register.phonePlaceholder")}
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

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {t("register.agreeToTerms")}{" "}
                          <Link to="#" className="text-primary hover:underline">
                            {t("register.termsOfService")}
                          </Link>{" "}
                          {t("register.and")}{" "}
                          <Link to="#" className="text-primary hover:underline">
                            {t("register.privacyPolicy")}
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t("register.processing") || "Đang xử lý..."}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t("register.submit") || "Đăng ký"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {t("register.alreadyHaveAccount")}{" "}
              <Link to="/dang-nhap" className="text-primary hover:underline font-medium">
                {t("register.loginNow")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Register;

