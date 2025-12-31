import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { fetchCategory, fetchCategories, updateCategory, clearCategoriesError } from "@/stores/categories/action";
import { AppDispatch, RootState } from "@/stores";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

const EditCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentCategory, loading, error } = useSelector((state: RootState) => state.categories);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Form validation schema with i18n
  const categoryFormSchema = z.object({
    name: z
      .string()
      .min(2, t("validation.categoryNameMin"))
      .max(50, t("validation.categoryNameMax")),
    description: z
      .string()
      .max(500, t("validation.categoryDescMax"))
      .optional(),
    status: z.enum(["active", "inactive"], {
      required_error: t("validation.statusRequired"),
    }),
    thumbnail: z.string().optional(),
  });

  type CategoryFormValues = z.infer<typeof categoryFormSchema>;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
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
        title: t("editCategory.invalidImage"),
        description: t("editCategory.invalidImageDesc"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("editCategory.imageTooLarge"),
        description: t("editCategory.imageTooLargeDesc"),
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

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Load category data
  useEffect(() => {
    if (!slug) {
      navigate("/admin/categories");
      return;
    }

    if (isAuthenticated && isAdmin) {
      dispatch(fetchCategory(slug));
    }
  }, [slug, navigate, dispatch, isAuthenticated, isAdmin]);

  // Set form values when category is loaded
  useEffect(() => {
    if (currentCategory && slug === currentCategory.slug) {
      // Set thumbnail preview
      setThumbnail(currentCategory.thumbnail || null);

      // Set form values
      form.reset({
        name: currentCategory.name,
        description: currentCategory.description || "",
        status: currentCategory.status || "active",
        thumbnail: currentCategory.thumbnail || "",
      });
    }
  }, [currentCategory, slug, form]);

  // Handle error
  useEffect(() => {
    if (error) {
      let errorMessage: string = "";
      if (typeof error === "object" && error !== null) {
        const errorMessages = Object.values(error).flat() as string[];
        errorMessage = errorMessages[0] || t("editCategory.notFoundDesc") || "Không thể tải thông tin danh mục";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      if (errorMessage) {
        toast({
          title: t("editCategory.notFound") || "Lỗi",
          description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
          variant: "destructive",
        });
        dispatch(clearCategoriesError());
        // Navigate back if it's a not found error
        if (errorMessage.includes("Không tìm thấy") || errorMessage.includes("not found")) {
          navigate("/admin/categories");
        }
      }
    }
  }, [error, toast, t, dispatch, navigate]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!slug) return;

    dispatch(clearCategoriesError());
    try {
      let thumbnailUrl = data.thumbnail || undefined;

      // Upload thumbnail to Cloudinary if there's a new file
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadToCloudinary(thumbnailFile);
          if (!thumbnailUrl) {
            toast({
              title: t("editCategory.failed") || "Lỗi",
              description: "Không thể upload hình ảnh lên Cloudinary",
              variant: "destructive",
            });
            return;
          }
        } catch (uploadError: any) {
          console.error("Error uploading to Cloudinary:", uploadError);
          toast({
            title: t("editCategory.failed") || "Lỗi",
            description: "Không thể upload hình ảnh lên Cloudinary",
            variant: "destructive",
          });
          return;
        }
      }

      await dispatch(updateCategory(slug, {
        name: data.name,
        description: data.description || undefined,
        thumbnail: thumbnailUrl,
        status: data.status,
      }));

      // Refresh categories list to ensure data is up to date
      await dispatch(fetchCategories());

      toast({
        title: t("editCategory.success") || "Thành công",
        description: t("editCategory.successDesc", { name: data.name }) || `Đã cập nhật danh mục "${data.name}"`,
      });

      // Navigate back to categories list
      navigate("/admin/categories");
    } catch (error: any) {
      // Error đã được xử lý trong reducer và useEffect
      console.error("Error updating category:", error);
    }
  };

  // Loading or not authenticated
  if (authLoading || loading || !currentCategory) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("editCategory.loading")}</p>
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/categories")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("editCategory.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("editCategory.description")}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("editCategory.categoryInfo")}</CardTitle>
                  <CardDescription>
                    {t("editCategory.categoryInfoDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("editCategory.categoryName")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("editCategory.namePlaceholder")}
                            {...field}
                          />
                        </FormControl>
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
                        <FormLabel>{t("editCategory.categoryDescription")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("editCategory.descriptionPlaceholder")}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("editCategory.descriptionHelp")}
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
                        <FormLabel>{t("editCategory.thumbnail")}</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {thumbnail ? (
                              <div className="relative inline-block">
                                <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden bg-accent/50">
                                  <img
                                    src={thumbnail}
                                    alt={t("editCategory.thumbnail")}
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
                                  ? t("editCategory.changeThumbnail")
                                  : t("editCategory.uploadThumbnail")}
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          {t("editCategory.thumbnailHelp")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("editCategory.status")} <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">{t("adminCategories.statusActive")}</SelectItem>
                            <SelectItem value="inactive">{t("adminCategories.statusInactive")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("editCategory.statusHelp")}
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
                    disabled={form.formState.isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {form.formState.isSubmitting
                      ? t("editCategory.updating")
                      : t("editCategory.updateCategory")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/admin/categories")}
                    disabled={form.formState.isSubmitting}
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

export default EditCategory;

