import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Store,
  Palette,
  Mail,
  Save,
  Upload,
  Truck,
  FileText,
  Loader2,
  Image as ImageIcon,
  Search,
  Home,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { fetchSettings, updateSettings } from "@/lib/api";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { useSettings } from "@/contexts/SettingsContext";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { refresh: refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);

  // Form schemas
  const generalSettingsSchema = z.object({
    siteName: z.string().min(1, t("validation.required")),
    siteDescription: z.string().max(500, t("validation.maxLength", { max: 500 })).optional(),
    contactEmail: z.string().email(t("validation.invalidEmail")),
    contactPhone: z.string().min(10, t("validation.invalidPhone")),
    address: z.string().min(1, t("validation.required")),
  });

  const shippingSettingsSchema = z.object({
    freeShippingThreshold: z.string().regex(/^\d+$/, t("validation.mustBeNumber")),
    shippingFee: z.string().regex(/^\d+$/, t("validation.mustBeNumber")),
    estimatedDeliveryDays: z.string().regex(/^\d+\s*-\s*\d+(\s*(ngày|days))?$/i, t("validation.deliveryDaysFormat")),
  });

  const appearanceSettingsSchema = z.object({
    favicon: z.string().optional(),
    metaTitle: z.string().max(60, t("validation.maxLength", { max: 60 })).optional(),
    metaDescription: z.string().max(160, t("validation.maxLength", { max: 160 })).optional(),
    metaKeywords: z.string().max(255, t("validation.maxLength", { max: 255 })).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, t("validation.invalidColor")).optional(),
  });

  const homepageSettingsSchema = z.object({
    heroNewCollection: z.string().max(100, t("validation.maxLength", { max: 100 })).optional(),
    heroTitle: z.string().max(100, t("validation.maxLength", { max: 100 })).optional(),
    heroTitleHighlight: z.string().max(100, t("validation.maxLength", { max: 100 })).optional(),
    heroSubtitle: z.string().max(500, t("validation.maxLength", { max: 500 })).optional(),
    heroBackgroundImage: z.string().max(500, t("validation.maxLength", { max: 500 })).optional(),
  });

  // Type definitions
  type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;
  type ShippingSettingsValues = z.infer<typeof shippingSettingsSchema>;
  type AppearanceSettingsValues = z.infer<typeof appearanceSettingsSchema>;
  type HomepageSettingsValues = z.infer<typeof homepageSettingsSchema>;

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // General Settings Form
  const generalForm = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      siteName: "",
      siteDescription: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
    },
  });

  // Shipping Settings Form
  const shippingForm = useForm<ShippingSettingsValues>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: {
      freeShippingThreshold: "500000",
      shippingFee: "30000",
      estimatedDeliveryDays: "3-5",
    },
  });

  // Appearance Settings Form
  const appearanceForm = useForm<AppearanceSettingsValues>({
    resolver: zodResolver(appearanceSettingsSchema),
    defaultValues: {
      favicon: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      primaryColor: "#000000",
    },
  });

  // Homepage Settings Form
  const homepageForm = useForm<HomepageSettingsValues>({
    resolver: zodResolver(homepageSettingsSchema),
    defaultValues: {
      heroNewCollection: "",
      heroTitle: "",
      heroTitleHighlight: "",
      heroSubtitle: "",
      heroBackgroundImage: "",
    },
  });

  // Load settings from API
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Load general settings
        const generalData = await fetchSettings("general");
        if (generalData) {
          generalForm.reset({
            siteName: generalData.siteName || "",
            siteDescription: generalData.siteDescription || "",
            contactEmail: generalData.contactEmail || "",
            contactPhone: generalData.contactPhone || "",
            address: generalData.address || "",
          });
        }

        // Load shipping settings
        const shippingData = await fetchSettings("shipping");
        if (shippingData) {
          shippingForm.reset({
            freeShippingThreshold: shippingData.freeShippingThreshold || "500000",
            shippingFee: shippingData.shippingFee || "30000",
            estimatedDeliveryDays: shippingData.estimatedDeliveryDays || "3-5",
          });
        }

        // Load appearance settings
        const appearanceData = await fetchSettings("appearance");
        if (appearanceData) {
          appearanceForm.reset({
            favicon: appearanceData.favicon || "",
            metaTitle: appearanceData.metaTitle || "",
            metaDescription: appearanceData.metaDescription || "",
            metaKeywords: appearanceData.metaKeywords || "",
            primaryColor: appearanceData.primaryColor || "#000000",
          });
        }

        // Load homepage settings
        const homepageData = await fetchSettings("homepage");
        if (homepageData) {
          homepageForm.reset({
            heroNewCollection: homepageData.heroNewCollection || "",
            heroTitle: homepageData.heroTitle || "",
            heroTitleHighlight: homepageData.heroTitleHighlight || "",
            heroSubtitle: homepageData.heroSubtitle || "",
            heroBackgroundImage: homepageData.heroBackgroundImage || "",
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: t("common.error") || "Lỗi",
          description: t("settings.loadFailed") || "Không thể tải cài đặt",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  // Handle form submissions
  const onGeneralSubmit = async (data: GeneralSettingsValues) => {
    try {
      await updateSettings(data, "general");
      await refreshSettings(); // Refresh settings context
      toast({
        title: t("settings.saved") || "Đã lưu",
        description: t("settings.generalSaved") || "Đã lưu cài đặt chung",
      });
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.saveFailed") || "Không thể lưu cài đặt",
        variant: "destructive",
      });
    }
  };

  const onShippingSubmit = async (data: ShippingSettingsValues) => {
    try {
      await updateSettings(data, "shipping");
      await refreshSettings(); // Refresh settings context
      toast({
        title: t("settings.saved") || "Đã lưu",
        description: t("settings.shippingSaved") || "Đã lưu cài đặt vận chuyển",
      });
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.saveFailed") || "Không thể lưu cài đặt",
        variant: "destructive",
      });
    }
  };

  const onAppearanceSubmit = async (data: AppearanceSettingsValues) => {
    try {
      await updateSettings(data, "appearance");
      await refreshSettings(); // Refresh settings context
      toast({
        title: t("settings.saved") || "Đã lưu",
        description: t("settings.appearanceSaved") || "Đã lưu cài đặt giao diện",
      });
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.saveFailed") || "Không thể lưu cài đặt",
        variant: "destructive",
      });
    }
  };

  const onHomepageSubmit = async (data: HomepageSettingsValues) => {
    try {
      await updateSettings(data, "homepage");
      await refreshSettings(); // Refresh settings context
      toast({
        title: t("settings.saved") || "Đã lưu",
        description: t("settings.homepageSaved") || "Đã lưu cài đặt trang chủ",
      });
    } catch (error) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.saveFailed") || "Không thể lưu cài đặt",
        variant: "destructive",
      });
    }
  };

  // Handle hero background image upload
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.invalidImageFile") || "File phải là hình ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB for hero image)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.imageTooLarge") || "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingHeroImage(true);
    try {
      const url = await uploadToCloudinary(file);
      homepageForm.setValue("heroBackgroundImage", url);
      toast({
        title: t("settings.uploadSuccess") || "Tải lên thành công",
        description: t("adminSettings.heroImageUploaded") || "Đã tải lên ảnh nền Hero",
      });
    } catch (error) {
      console.error("Error uploading hero image:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.uploadFailed") || "Không thể tải lên ảnh nền Hero",
        variant: "destructive",
      });
    } finally {
      setUploadingHeroImage(false);
    }
  };

  // Handle favicon upload
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.invalidImageFile") || "File phải là hình ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 1MB for favicon)
    if (file.size > 1024 * 1024) {
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.imageTooLarge") || "Kích thước file không được vượt quá 1MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingFavicon(true);
    try {
      const url = await uploadToCloudinary(file);
      appearanceForm.setValue("favicon", url);
      toast({
        title: t("settings.uploadSuccess") || "Tải lên thành công",
        description: t("settings.faviconUploaded") || "Đã tải lên favicon",
      });
    } catch (error) {
      console.error("Error uploading favicon:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("settings.uploadFailed") || "Không thể tải lên favicon",
        variant: "destructive",
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <PageTitle titleKey="adminSettings" />
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground font-serif">
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("settings.description")}
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">{t("settings.general")}</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">{t("settings.shipping")}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{t("settings.appearance")}</span>
            </TabsTrigger>
            <TabsTrigger value="homepage" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t("settings.homepage")}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Form {...generalForm}>
              <form
                onSubmit={generalForm.handleSubmit(onGeneralSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      {t("adminSettings.storeInfo")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.storeInfoDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.siteName")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="siteDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.siteDescription")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[80px]" />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.siteDescriptionHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {t("adminSettings.contactInfo")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.contactInfoDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.contactEmail")}</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.contactPhone")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.address")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[80px]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={generalForm.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {generalForm.formState.isSubmitting ? t("adminSettings.saving") : t("adminSettings.saveChanges")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Shipping Settings */}
          <TabsContent value="shipping" className="space-y-6">
            <Form {...shippingForm}>
              <form
                onSubmit={shippingForm.handleSubmit(onShippingSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      {t("adminSettings.shippingSettings")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.shippingSettingsDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={shippingForm.control}
                      name="freeShippingThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.freeShippingThreshold")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.freeShippingThresholdDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={shippingForm.control}
                      name="shippingFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.shippingFee")}</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.shippingFeeDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={shippingForm.control}
                      name="estimatedDeliveryDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.estimatedDeliveryDays")}</FormLabel>
                          <FormControl>
                            <Input placeholder="3-5" {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.estimatedDeliveryDaysDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={shippingForm.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {shippingForm.formState.isSubmitting ? t("adminSettings.saving") : t("adminSettings.saveChanges")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Form {...appearanceForm}>
              <form
                onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      {t("adminSettings.favicon")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.faviconDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={appearanceForm.control}
                      name="favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.favicon")}</FormLabel>
                          <div className="flex items-center gap-4">
                            {field.value && (
                              <div className="flex items-center gap-2">
                                <img
                                  src={field.value}
                                  alt="Favicon"
                                  className="w-16 h-16 object-contain border rounded"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <Input
                                type="text"
                                placeholder={t("adminSettings.faviconUrlPlaceholder")}
                                {...field}
                                className="mb-2"
                              />
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFaviconUpload}
                                  disabled={uploadingFavicon}
                                  className="hidden"
                                  id="favicon-upload"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("favicon-upload")?.click()}
                                  disabled={uploadingFavicon}
                                >
                                  {uploadingFavicon ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      {t("adminSettings.uploading")}
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      {t("adminSettings.uploadFavicon")}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <FormDescription>
                            {t("adminSettings.faviconHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      {t("adminSettings.seoSettings")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.seoSettingsDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={appearanceForm.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.metaTitle")}</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={60} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.metaTitleDesc")} ({field.value?.length || 0}/60)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appearanceForm.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.metaDescription")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[80px]" maxLength={160} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.metaDescriptionDesc")} ({field.value?.length || 0}/160)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appearanceForm.control}
                      name="metaKeywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.metaKeywords")}</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={255} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.metaKeywordsDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      {t("adminSettings.colorSettings")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.colorSettingsDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={appearanceForm.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.primaryColor")}</FormLabel>
                          <div className="flex items-center gap-4">
                            <FormControl>
                              <Input
                                type="color"
                                {...field}
                                className="w-20 h-10 cursor-pointer"
                              />
                            </FormControl>
                            <Input
                              type="text"
                              {...field}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                          <FormDescription>
                            {t("adminSettings.primaryColorDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={appearanceForm.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {appearanceForm.formState.isSubmitting ? t("adminSettings.saving") : t("adminSettings.saveChanges")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Homepage Settings */}
          <TabsContent value="homepage" className="space-y-6">
            <Form {...homepageForm}>
              <form
                onSubmit={homepageForm.handleSubmit(onHomepageSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      {t("adminSettings.homepageSettings")}
                    </CardTitle>
                    <CardDescription>
                      {t("adminSettings.homepageSettingsDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={homepageForm.control}
                      name="heroNewCollection"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.heroNewCollection")}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t("adminSettings.heroNewCollectionPlaceholder")} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.heroNewCollectionDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={homepageForm.control}
                      name="heroTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.heroTitle")}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t("adminSettings.heroTitlePlaceholder")} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.heroTitleDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={homepageForm.control}
                      name="heroTitleHighlight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.heroTitleHighlight")}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t("adminSettings.heroTitleHighlightPlaceholder")} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.heroTitleHighlightDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={homepageForm.control}
                      name="heroSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.heroSubtitle")}</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="min-h-[100px]" placeholder={t("adminSettings.heroSubtitlePlaceholder")} />
                          </FormControl>
                          <FormDescription>
                            {t("adminSettings.heroSubtitleDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={homepageForm.control}
                      name="heroBackgroundImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminSettings.heroBackgroundImage")}</FormLabel>
                          <div className="space-y-2">
                            {field.value && (
                              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                                <img
                                  src={field.value}
                                  alt="Hero background preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder={t("adminSettings.heroBackgroundImagePlaceholder")}
                                {...field}
                                className="mb-2"
                              />
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleHeroImageUpload}
                                  disabled={uploadingHeroImage}
                                  className="hidden"
                                  id="hero-image-upload"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("hero-image-upload")?.click()}
                                  disabled={uploadingHeroImage}
                                >
                                  {uploadingHeroImage ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      {t("adminSettings.uploading")}
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      {t("adminSettings.uploadHeroImage")}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                          <FormDescription>
                            {t("adminSettings.heroBackgroundImageDesc")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {t("adminSettings.saveChanges")}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
