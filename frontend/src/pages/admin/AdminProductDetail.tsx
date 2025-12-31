import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  Barcode,
  Tag,
  FileText,
  ImageIcon,
  Loader2,
  Star,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/admin/AdminLayout";
import { fetchProduct, deleteProduct, clearProductsError } from "@/stores/products/action";
import { AppDispatch, RootState } from "@/stores";
import { useSocket } from "@/contexts/SocketContext";
import { useReviews } from "@/hooks/useApi";
import { replyToReview, type Review as APIReview } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

// Review interface is imported from @/lib/api

const AdminProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);

  // Get product from Redux
  const { currentProduct, loading: isLoadingProduct, error } = useSelector((state: RootState) => state.products);

  // Fetch reviews from API
  const { data: reviewsData, isLoading: isLoadingReviews } = useReviews(slug || "", {
    page: reviewsPage,
    per_page: 10,
  });

  const reviews = reviewsData?.reviews || [];
  const reviewCount = reviewsData?.pagination.total || 0;

  // Fetch product on mount
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
          title: t("adminProductDetail.notFound"),
          description: t("adminProductDetail.notFoundDesc"),
          variant: "destructive",
        });
        navigate("/admin/products");
      }
    };

    if (isAuthenticated && isAdmin && slug) {
      loadProduct();
    }
  }, [slug, isAuthenticated, isAdmin, dispatch, navigate, toast, t]);

  // Handle error
  useEffect(() => {
    if (error) {
      let errorMessage: string = "";
      if (typeof error === "object" && error !== null) {
        const errorMessages = Object.values(error).flat() as string[];
        errorMessage = errorMessages[0] || t("common.error") || "Có lỗi xảy ra";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      if (errorMessage) {
        toast({
          title: t("common.error") || "Lỗi",
          description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
          variant: "destructive",
        });
        dispatch(clearProductsError());
      }
    }
  }, [error, toast, t, dispatch]);

  // Listen to socket events for real-time review updates
  useEffect(() => {
    if (!slug || !isAuthenticated || !isAdmin) return;

    // Nếu không có socket, thử connect
    if (!socket) {
      console.log("Socket not available, attempting to connect...");
      return;
    }

    // Kiểm tra socket đã connected chưa
    if (!socket.connected) {
      console.log("Socket not connected yet, waiting...");
      const handleConnect = () => {
        console.log("Socket connected, setting up review listeners");
      };
      socket.once("connect", handleConnect);
      return () => {
        socket.off("connect", handleConnect);
      };
    }

    console.log("Setting up admin review socket listeners for product:", slug);

    // Listen for new review created
    const handleReviewCreated = (data: { productSlug: string; review: APIReview }) => {
      console.log("Review event received:", data);
      if (data.productSlug === slug) {
        console.log("New review received via socket for current product:", data);
        // Invalidate and refetch reviews
        queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
        toast({
          title: t("adminProductDetail.newReview") || "Đánh giá mới",
          description: t("adminProductDetail.newReviewDesc") || "Có đánh giá mới cho sản phẩm này",
        });
      } else {
        console.log("Review event for different product, ignoring");
      }
    };

    // Listen for review reply added
    const handleReviewReplyAdded = (data: { productSlug: string; reviewId: number; review: APIReview }) => {
      console.log("Review reply event received:", data);
      if (data.productSlug === slug) {
        console.log("Review reply received via socket for current product:", data);
        // Invalidate and refetch reviews
        queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
        toast({
          title: t("adminProductDetail.replyAdded") || "Phản hồi mới",
          description: t("adminProductDetail.replyAddedDesc") || "Có phản hồi mới cho đánh giá",
        });
      } else {
        console.log("Review reply event for different product, ignoring");
      }
    };

    // Register event listeners
    socket.on("review:created", handleReviewCreated);
    socket.on("review:reply:added", handleReviewReplyAdded);

    console.log("Admin review socket listeners registered for product:", slug);
    console.log("Socket connected:", socket.connected);
    console.log("Socket ID:", socket.id);

    // Cleanup: remove listeners on unmount or when socket/slug changes
    return () => {
      console.log("Cleaning up admin review socket listeners");
      socket.off("review:created", handleReviewCreated);
      socket.off("review:reply:added", handleReviewReplyAdded);
    };
  }, [socket, slug, isAuthenticated, isAdmin, queryClient, toast, t]);

  // Images array from backend
  const images = currentProduct?.images && currentProduct.images.length > 0
    ? currentProduct.images
    : (currentProduct?.image ? [currentProduct.image] : []);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return {
          label: t("products.statusAvailable"),
          variant: "default" as const,
        };
      case "low_stock":
        return {
          label: t("products.statusLowStock"),
          variant: "secondary" as const,
        };
      case "out_of_stock":
        return {
          label: t("products.statusOutOfStock"),
          variant: "destructive" as const,
        };
      case "discontinued":
        return {
          label: t("products.statusDiscontinued"),
          variant: "outline" as const,
        };
      default:
        return {
          label: t("common.unknown"),
          variant: "outline" as const,
        };
    }
  };

  const handleEdit = () => {
    if (slug) {
      navigate(`/admin/products/${slug}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!slug || !currentProduct) return;

    try {
      await dispatch(deleteProduct(slug));
      toast({
        title: t("adminProductDetail.deleteProduct"),
        description: t("adminProductDetail.deletedProduct", { name: currentProduct.name }),
      });
      setDeleteDialogOpen(false);
      navigate("/admin/products");
    } catch (error) {
      // Error already handled in useEffect
    }
  };

  const handleViewOnSite = () => {
    if (currentProduct?.slug) {
      window.open(`/product/${currentProduct.slug}`, "_blank");
    }
  };

  // Loading or not authenticated
  if (authLoading || isLoadingProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{t("adminProductDetail.loading") || "Đang tải..."}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (!currentProduct) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6 pb-6">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("adminProductDetail.notFound")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("adminProductDetail.notFoundDesc")}
              </p>
              <Button onClick={() => navigate("/admin/products")}>
                {t("adminProductDetail.backToList")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = getStatusConfig(currentProduct.status);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/products")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {t("adminProductDetail.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("adminProductDetail.description")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleViewOnSite}>
              <Eye className="h-4 w-4 mr-2" />
              {t("adminProductDetail.viewOnWeb")}
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteClick}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("common.delete")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images & Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Images */}
                  <div className="space-y-4">
                    <div className="aspect-square rounded-lg border border-border overflow-hidden bg-accent/50">
                      {images[selectedImage] ? (
                        <img
                          src={images[selectedImage]}
                          alt={currentProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                              selectedImage === index
                                ? "border-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${currentProduct.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground mt-2">
                        {currentProduct.name}
                      </h2>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {currentProduct.brand && (
                          <>
                            <span>{currentProduct.brand}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{currentProduct.category || "-"}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("adminProductDetail.salePrice")}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary">
                          {formatPrice(currentProduct.price)}
                        </span>
                        {currentProduct.originalPrice && (
                          <>
                            <span className="text-lg text-muted-foreground line-through">
                              {formatPrice(currentProduct.originalPrice)}
                            </span>
                            <Badge variant="destructive">
                              -
                              {Math.round(
                                ((currentProduct.originalPrice - currentProduct.price) /
                                  currentProduct.originalPrice) *
                                  100
                              )}
                              %
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted-foreground">{t("adminProductDetail.stock")}</p>
                        <p
                          className={`text-2xl font-bold ${
                            currentProduct.stock < 10
                              ? "text-red-600"
                              : currentProduct.stock < 30
                              ? "text-yellow-600"
                              : "text-foreground"
                          }`}
                        >
                          {currentProduct.stock}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent">
                        <p className="text-xs text-muted-foreground">{t("adminProductDetail.sold")}</p>
                        <p className="text-2xl font-bold text-foreground">
                          0
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details Tabs */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">{t("adminProductDetail.descriptionTab")}</TabsTrigger>
                    <TabsTrigger value="ingredients">{t("adminProductDetail.ingredientsTab")}</TabsTrigger>
                    <TabsTrigger value="reviews">
                      {t("adminProductDetail.reviewsTab") || "Đánh giá"} ({reviewCount})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    {currentProduct.description ? (
                      <div
                        className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: currentProduct.description }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("adminProductDetail.noDescription") || "Chưa có mô tả"}
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="ingredients" className="mt-4">
                    {currentProduct.ingredients ? (
                      <div
                        className="prose prose-sm max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: currentProduct.ingredients }}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t("adminProductDetail.noIngredients")}
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-4">
                    <div className="space-y-6">
                      {isLoadingReviews ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : reviews.length > 0 ? (
                        reviews.map((review: APIReview) => (
                          <div key={review.id} className="border-b border-border pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={review.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {review.user.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold text-foreground">{review.user}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-4 w-4 ${
                                            i < Math.floor(review.rating)
                                              ? "fill-primary text-primary"
                                              : "fill-muted text-muted"
                                          }`}
                                        />
                                      ))}
                                      <span className="text-sm text-muted-foreground ml-1">
                                        {review.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{review.date}</span>
                                </div>
                                <p className="text-foreground mt-3">{review.comment}</p>
                                
                                {/* Admin Reply Section */}
                                {review.reply ? (
                                  <div className="mt-4 p-4 bg-secondary/30 rounded-lg border-l-4 border-primary">
                                    <div className="flex items-center gap-2 mb-2">
                                      <MessageSquare className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-semibold text-primary">
                                        {t("adminProductDetail.adminReply") || "Phản hồi từ Admin"}
                                      </span>
                                    </div>
                                    <p className="text-foreground text-sm">{review.reply}</p>
                                    <span className="text-xs text-muted-foreground mt-2 block">
                                      {review.replyDate}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="mt-4">
                                    {replyingTo === review.id ? (
                                      <div className="space-y-3">
                                        <Textarea
                                          placeholder={t("adminProductDetail.replyPlaceholder") || "Nhập phản hồi của bạn..."}
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          className="min-h-[100px]"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={async () => {
                                              if (!slug || !replyText.trim()) return;
                                              
                                              setIsSubmittingReply(true);
                                              try {
                                                await replyToReview(slug, review.id, replyText);
                                                toast({
                                                  title: t("adminProductDetail.replySuccess") || "Thành công",
                                                  description: t("adminProductDetail.replySuccessDesc") || "Đã gửi phản hồi thành công",
                                                });
                                                // Invalidate queries to refetch reviews
                                                queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
                                                setReplyingTo(null);
                                                setReplyText("");
                                              } catch (error: unknown) {
                                                const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t("adminProductDetail.replyErrorDesc") || "Không thể gửi phản hồi";
                                                toast({
                                                  title: t("adminProductDetail.replyError") || "Lỗi",
                                                  description: errorMessage,
                                                  variant: "destructive",
                                                });
                                              } finally {
                                                setIsSubmittingReply(false);
                                              }
                                            }}
                                            disabled={!replyText.trim() || isSubmittingReply}
                                          >
                                            <Send className="h-4 w-4 mr-2" />
                                            {t("adminProductDetail.sendReply") || "Gửi phản hồi"}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setReplyingTo(null);
                                              setReplyText("");
                                            }}
                                          >
                                            {t("common.cancel") || "Hủy"}
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setReplyingTo(review.id)}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        {t("adminProductDetail.replyToReview") || "Trả lời đánh giá"}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {t("adminProductDetail.noReviews") || "Chưa có đánh giá nào"}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Product Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Product Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>{t("adminProductDetail.productInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Barcode className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t("adminProductDetail.productId")}</p>
                    <p className="font-medium">#{currentProduct.id}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t("adminProductDetail.slug")}</p>
                    <code className="text-xs bg-accent px-2 py-1 rounded">
                      {currentProduct.slug}
                    </code>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{t("adminProductDetail.category")}</p>
                    <p className="font-medium">{currentProduct.category || "-"}</p>
                  </div>
                </div>

                {currentProduct.brand && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{t("adminProductDetail.brand")}</p>
                        <p className="font-medium">{currentProduct.brand}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{t("adminProductDetail.statistics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("adminProductDetail.views")}</span>
                  <span className="font-semibold">0</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("adminProductDetail.sold")}</span>
                  <span className="font-semibold">0</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("adminProductDetail.revenue")}</span>
                  <span className="font-semibold text-primary">
                    {formatPrice(0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>{t("adminProductDetail.timestamps")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("adminProductDetail.createdAt")}</p>
                  <p className="font-medium">
                    {currentProduct.createdAt 
                      ? new Date(currentProduct.createdAt).toLocaleDateString("vi-VN")
                      : t("adminProductDetail.unknown")}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("adminProductDetail.updatedAt")}
                  </p>
                  <p className="font-medium">
                    {currentProduct.updatedAt
                      ? new Date(currentProduct.updatedAt).toLocaleDateString("vi-VN")
                      : t("adminProductDetail.unknown")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("adminProductDetail.confirmDelete", { name: currentProduct?.name || "" })}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("products.deleteWarning", { name: currentProduct?.name || "" })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProductDetail;

