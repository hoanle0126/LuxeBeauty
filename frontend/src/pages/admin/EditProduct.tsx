import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import TiptapEditor from "@/components/ui/tiptap-editor";
import { fetchProduct, updateProduct, fetchProducts, clearProductsError } from "@/stores/products/action";
import { fetchCategories } from "@/stores/categories/action";
import { fetchBrands } from "@/stores/brands/action";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { AppDispatch, RootState } from "@/stores";
import FilterCombobox from "@/components/admin/FilterCombobox";

interface ImageFile {
  id: string;
  url: string;
  file?: File;
}

const EditProduct = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Get product, categories, brands from Redux
  const { currentProduct, loading: isLoadingProduct, error } = useSelector((state: RootState) => state.products);
  const { categories, loading: isLoadingCategories } = useSelector((state: RootState) => state.categories);
  const { brands, loading: isLoadingBrands } = useSelector((state: RootState) => state.brands);

  // Get category and brand names for FilterCombobox
  const categoryNames = categories.map((cat) => cat.name);
  const brandNames = brands.map((brand) => brand.name);

  // Form validation schema with i18n
  const productFormSchema = z.object({
    name: z
      .string()
      .min(3, t("validation.productNameMin"))
      .max(100, t("validation.productNameMax")),
    category: z.string().min(1, t("validation.categoryRequired")),
    brand: z.string().optional(),
    price: z
      .string()
      .min(1, t("validation.priceRequired"))
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: t("validation.pricePositive"),
      }),
    originalPrice: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        {
          message: t("validation.originalPricePositive"),
        }
      ),
    stock: z
      .string()
      .min(1, t("validation.stockRequired"))
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: t("validation.stockNonNegative"),
      }),
    status: z.enum(["available", "low_stock", "out_of_stock", "discontinued"], {
      required_error: t("validation.statusRequired"),
    }),
    description: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 10, {
        message: t("validation.descriptionMin"),
      }),
    ingredients: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length === 0 || val.trim().length >= 10, {
        message: t("validation.ingredientsMin"),
      }),
  });

  type ProductFormValues = z.infer<typeof productFormSchema>;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "__none__",
      price: "",
      originalPrice: "",
      stock: "0",
      status: "available",
      description: "",
      ingredients: "",
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Fetch categories and brands on mount
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      dispatch(fetchCategories({ per_page: 200 }));
      dispatch(fetchBrands({ per_page: 200 }));
    }
  }, [isAuthenticated, isAdmin, dispatch]);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        navigate("/admin/products");
        return;
      }

      try {
        await dispatch(fetchProduct(slug));
      } catch (error) {
        toast({
          title: t("editProduct.notFound"),
          description: t("editProduct.notFoundDesc"),
          variant: "destructive",
        });
        navigate("/admin/products");
      }
    };

    if (isAuthenticated && isAdmin && slug) {
      loadProduct();
    }
  }, [slug, isAuthenticated, isAdmin, dispatch, navigate, toast, t]);

  // Set form values when product is loaded
  useEffect(() => {
    if (currentProduct) {
      form.reset({
        name: currentProduct.name,
        category: currentProduct.category || "",
        brand: currentProduct.brand || "__none__",
        price: currentProduct.price.toString(),
        originalPrice: currentProduct.originalPrice?.toString() || "",
        stock: currentProduct.stock.toString(),
        status: currentProduct.status,
        description: currentProduct.description || "",
        ingredients: currentProduct.ingredients || "",
      });

      // Set existing images
      if (currentProduct.images && currentProduct.images.length > 0) {
        setImages(
          currentProduct.images.map((img, index) => ({
            id: `existing-${index}`,
            url: img,
          }))
        );
      } else if (currentProduct.image) {
        // Backward compatibility
        setImages([
          {
            id: "1",
            url: currentProduct.image,
          },
        ]);
      }
    }
  }, [currentProduct, form]);

  // Handle error
  useEffect(() => {
    if (error) {
      let errorMessage: string = "";
      if (typeof error === "object" && error !== null) {
        const errorMessages = Object.values(error).flat() as string[];
        errorMessage = errorMessages[0] || t("editProduct.failedDesc") || "Không thể cập nhật sản phẩm";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      if (errorMessage) {
        toast({
          title: t("editProduct.failed") || "Lỗi",
          description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
          variant: "destructive",
        });
        dispatch(clearProductsError());
      }
    }
  }, [error, toast, t, dispatch]);

  // Handle image file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages: ImageFile[] = [];
    let loadedCount = 0;

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t("editProduct.invalidImage") || "Lỗi",
          description: t("editProduct.invalidImageDesc") || "File phải là hình ảnh",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("editProduct.imageTooLarge") || "Lỗi",
          description: t("editProduct.imageTooLargeDesc") || "Kích thước file không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        loadedCount++;
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          file,
        });
        
        // When all files are loaded, update state
        if (loadedCount === fileArray.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.onerror = () => {
        toast({
          title: t("editProduct.failed") || "Lỗi",
          description: "Không thể đọc file hình ảnh",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  // Add image from URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;

    if (!imageUrlInput.startsWith("http")) {
      toast({
        title: t("editProduct.invalidUrl"),
        description: t("editProduct.invalidUrlDesc"),
        variant: "destructive",
      });
      return;
    }

    setImages((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrlInput,
      },
    ]);
    setImageUrlInput("");
  };

  // Remove image
  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!slug) return;

    dispatch(clearProductsError());
    try {
      if (images.length === 0) {
        toast({
          title: t("editProduct.missingImages"),
          description: t("editProduct.missingImagesDesc"),
          variant: "destructive",
        });
        return;
      }

      // Find category and brand IDs from their names
      const selectedCategory = categories.find((cat) => cat.name === data.category);
      if (!selectedCategory) {
        toast({
          title: t("editProduct.failed") || "Lỗi",
          description: `Không tìm thấy danh mục: ${data.category}. Vui lòng chọn lại danh mục.`,
          variant: "destructive",
        });
        return;
      }
      const categoryId = selectedCategory.id;

      // Convert __none__ to null for brand
      let brandId: number | null = null;
      if (data.brand && data.brand !== "__none__") {
        const selectedBrand = brands.find((b) => b.name === data.brand);
        if (!selectedBrand) {
          toast({
            title: t("editProduct.failed") || "Lỗi",
            description: `Không tìm thấy thương hiệu: ${data.brand}. Vui lòng chọn lại thương hiệu.`,
            variant: "destructive",
          });
          return;
        }
        brandId = selectedBrand.id;
      }

      // Upload all images to Cloudinary
      const uploadedImages: string[] = [];
      for (const image of images) {
        if (image.file) {
          try {
            const imageUrl = await uploadToCloudinary(image.file);
            if (imageUrl) {
              uploadedImages.push(imageUrl);
            }
          } catch (uploadError: unknown) {
            console.error("Error uploading to Cloudinary:", uploadError);
            toast({
              title: t("editProduct.failed") || "Lỗi",
              description: "Không thể upload một số hình ảnh lên Cloudinary",
              variant: "destructive",
            });
            return;
          }
        } else if (image.url) {
          // URL đã có sẵn
          uploadedImages.push(image.url);
        }
      }

      if (uploadedImages.length === 0) {
        toast({
          title: t("editProduct.failed") || "Lỗi",
          description: "Vui lòng thêm ít nhất một hình ảnh",
          variant: "destructive",
        });
        return;
      }

      await dispatch(updateProduct(slug, {
        name: data.name,
        categoryId: categoryId,
        brandId: brandId,
        price: Number(data.price),
        originalPrice: data.originalPrice && data.originalPrice.trim() !== "" ? Number(data.originalPrice) : null,
        images: uploadedImages,
        description: data.description && data.description.trim() !== "" ? data.description : null,
        ingredients: data.ingredients && data.ingredients.trim() !== "" ? data.ingredients : null,
        stock: Number(data.stock),
        status: data.status,
      }));

      // Refresh products list
      await dispatch(fetchProducts());

      toast({
        title: t("editProduct.success"),
        description: t("editProduct.successDesc", { name: data.name }),
      });

      // Navigate back to products list
      navigate("/admin/products");
    } catch (error) {
      // Error already handled in useEffect
    }
  };

  // Loading or not authenticated
  if (authLoading || isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("editProduct.loading")}</p>
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
              onClick={() => navigate(`/admin/products/${slug}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("editProduct.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("editProduct.description")}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("addProduct.basicInfo")}</CardTitle>
                    <CardDescription>
                      {t("addProduct.basicInfoDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("addProduct.productName")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("addProduct.productNamePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("addProduct.category")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <FilterCombobox
                              items={categoryNames}
                              selectedValue={field.value || "all"}
                              onSelect={(value) => {
                                if (value !== "all") {
                                  field.onChange(value);
                                }
                              }}
                              loading={isLoadingCategories}
                              hasMore={false}
                              onLoadMore={() => {}}
                              placeholder={t("products.category")}
                              searchPlaceholder={
                                t("products.searchCategory") || "Tìm danh mục..."
                              }
                              allLabel={t("products.allCategories")}
                              total={categories.length}
                              className="w-full"
                              width="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Brand */}
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("addProduct.brand")}</FormLabel>
                          <FormControl>
                            <FilterCombobox
                              items={brandNames}
                              selectedValue={field.value === "__none__" ? "all" : field.value || "all"}
                              onSelect={(value) => {
                                if (value === "all") {
                                  field.onChange("__none__");
                                } else {
                                  field.onChange(value);
                                }
                              }}
                              loading={isLoadingBrands}
                              hasMore={false}
                              onLoadMore={() => {}}
                              placeholder={t("products.brand")}
                              searchPlaceholder={
                                t("products.searchBrand") || "Tìm thương hiệu..."
                              }
                              allLabel={t("addProduct.noBrand")}
                              total={brands.length}
                              className="w-full"
                              width="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            {t("addProduct.brandHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description with Tiptap */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("addProduct.productDescription")} <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <TiptapEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t("addProduct.descriptionPlaceholder")}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("addProduct.descriptionHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Ingredients */}
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("addProduct.ingredients")}</FormLabel>
                          <FormControl>
                            <TiptapEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder={t("addProduct.ingredientsPlaceholder")}
                            />
                          </FormControl>
                          <FormDescription>
                            {t("addProduct.ingredientsHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Pricing & Inventory */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("addProduct.pricingInventory")}</CardTitle>
                    <CardDescription>
                      {t("addProduct.pricingInventoryDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Price */}
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("addProduct.price")} <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="650000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Original Price */}
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("addProduct.originalPrice")}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="850000"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("addProduct.originalPriceHelp")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Stock */}
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("addProduct.stock")} <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...field}
                              />
                            </FormControl>
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
                              {t("addProduct.status")} <span className="text-destructive">*</span>
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
                                <SelectItem value="available">{t("addProduct.statusAvailable")}</SelectItem>
                                <SelectItem value="low_stock">{t("addProduct.statusLowStock")}</SelectItem>
                                <SelectItem value="out_of_stock">{t("addProduct.statusOutOfStock")}</SelectItem>
                                <SelectItem value="discontinued">{t("addProduct.statusDiscontinued")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Images & Actions */}
              <div className="lg:col-span-1 space-y-6">
                {/* Product Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("addProduct.images")}</CardTitle>
                    <CardDescription>
                      {t("addProduct.imagesDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image List */}
                    <div className="grid grid-cols-2 gap-3">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative aspect-square rounded-lg border border-border overflow-hidden group"
                        >
                          <img
                            src={image.url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleRemoveImage(image.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                              {t("addProduct.primaryImage")}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add Image Placeholder */}
                      {images.length < 6 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-border bg-accent/50 flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                          <Plus className="h-8 w-8 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">
                            {t("addProduct.addImage")}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>

                    {/* Image URL Input */}
                    <div className="space-y-2">
                      <FormLabel>{t("addProduct.orAddFromUrl")}</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("addProduct.imageUrlPlaceholder")}
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddImageUrl}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Upload Instructions */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {t("addProduct.maxImages")}</p>
                      <p>• {t("addProduct.primaryImageNote")}</p>
                      <p>• {t("addProduct.formats")}</p>
                      <p>• {t("addProduct.recommendedSize")}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {form.formState.isSubmitting ? t("editProduct.updating") : t("editProduct.updateProduct")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/admin/products/${slug}`)}
                      disabled={form.formState.isSubmitting}
                    >
                      {t("common.cancel")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;

