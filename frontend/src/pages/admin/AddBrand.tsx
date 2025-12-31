import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { useDispatch, useSelector } from "react-redux";
import { createBrand, clearBrandsError } from "@/stores/brands/action";
import { AppDispatch, RootState } from "@/stores";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

const AddBrand = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { loading, error } = useSelector((state: RootState) => state.brands);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Form validation schema with i18n
  const brandFormSchema = z.object({
    name: z
      .string()
      .min(2, t("validation.brandNameMin"))
      .max(50, t("validation.brandNameMax")),
    description: z
      .string()
      .max(500, t("validation.brandDescMax"))
      .optional(),
    thumbnail: z.string().optional(),
  });

  type BrandFormValues = z.infer<typeof brandFormSchema>;

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      thumbnail: "",
    },
  });

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("editBrand.invalidImage"),
        description: t("editBrand.invalidImageDesc"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("editBrand.imageTooLarge"),
        description: t("editBrand.imageTooLargeDesc"),
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
      setThumbnailFile(file);
      form.setValue("thumbnail", reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = "";
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailFile(null);
    form.setValue("thumbnail", "");
  };

  // Handle error
  useEffect(() => {
    if (error) {
      let errorMessage: string = "";
      if (typeof error === "object" && error !== null) {
        const errorMessages = Object.values(error).flat() as string[];
        errorMessage = errorMessages[0] || t("addBrand.failedDesc") || "Không thể tạo thương hiệu";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      if (errorMessage) {
        toast({
          title: t("addBrand.failed") || "Lỗi",
          description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
          variant: "destructive",
        });
        dispatch(clearBrandsError());
      }
    }
  }, [error, toast, t, dispatch]);

  const onSubmit = async (data: BrandFormValues) => {
    dispatch(clearBrandsError());
    try {
      let thumbnailUrl = data.thumbnail || undefined;

      // Upload thumbnail to Cloudinary if there's a new file
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadToCloudinary(thumbnailFile);
          if (!thumbnailUrl) {
            toast({
              title: t("addBrand.failed") || "Lỗi",
              description: "Không thể upload hình ảnh lên Cloudinary",
              variant: "destructive",
            });
            return;
          }
        } catch (uploadError: any) {
          console.error("Error uploading to Cloudinary:", uploadError);
          toast({
            title: t("addBrand.failed") || "Lỗi",
            description: "Không thể upload hình ảnh lên Cloudinary",
            variant: "destructive",
          });
          return;
        }
      }

      await dispatch(createBrand({
        name: data.name,
        description: data.description || undefined,
        thumbnail: thumbnailUrl,
        status: "active",
      }));

      toast({
        title: t("addBrand.success") || "Thành công",
        description: t("addBrand.successDesc", { name: data.name }) || `Đã tạo thương hiệu "${data.name}"`,
      });

      // Navigate back to brands list
      navigate("/admin/brands");
    } catch (error: any) {
      // Error đã được xử lý trong reducer và useEffect
      console.error("Error creating brand:", error);
    }
  };

  // Loading or not authenticated
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/brands")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("addBrand.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("addBrand.description")}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("addBrand.brandInfo")}</CardTitle>
                  <CardDescription>
                    {t("addBrand.brandInfoDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Brand Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("addBrand.brandName")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("addBrand.namePlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("addBrand.slugAutoGenerate")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("addBrand.brandDescription")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("addBrand.descriptionPlaceholder")}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("addBrand.descriptionHelp")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Thumbnail */}
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("editBrand.thumbnail")}</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {thumbnail ? (
                              <div className="relative inline-block">
                                <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden bg-accent/50">
                                  <img
                                    src={thumbnail}
                                    alt={t("editBrand.thumbnail")}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                  onClick={handleRemoveThumbnail}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center w-32 h-32 rounded-lg border-2 border-dashed border-border bg-accent/50">
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                                className="hidden"
                                id="thumbnail-upload"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  document.getElementById("thumbnail-upload")?.click()
                                }
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {thumbnail
                                  ? t("editBrand.changeThumbnail")
                                  : t("editBrand.uploadThumbnail")}
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("editBrand.thumbnailHelp")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting || loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {(form.formState.isSubmitting || loading)
                      ? t("addBrand.saving")
                      : t("addBrand.saveBrand")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/admin/brands")}
                    disabled={form.formState.isSubmitting || loading}
                  >
                    {t("common.cancel")}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </Form>
      </div>
    </AdminLayout>
  );
};

export default AddBrand;

