import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  ShoppingBag,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Check,
  ThumbsUp,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useReviews, useSubmitReview } from "@/hooks/useApi";
import { fetchProduct } from "@/stores/products/action";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/stores";
import DOMPurify from "dompurify";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/contexts/SocketContext";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const ProductDetail = () => {
  const params = useParams();
  const slug = params.slug || params.id; // Handle both :slug and :id routes
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSort, setReviewsSort] = useState<
    "newest" | "highest" | "lowest"
  >("newest");
  const reviewsPerPage = 5;

  // Get product from Redux store
  const {
    currentProduct,
    loading: isLoadingProduct,
    error: productError,
  } = useSelector((state: RootState) => state.products);

  // Fetch reviews using React Query with pagination and sorting
  const { data: reviewsData, isLoading: isLoadingReviews } = useReviews(
    slug || "",
    {
      page: reviewsPage,
      per_page: reviewsPerPage,
      sort: reviewsSort,
    }
  );

  // Submit review mutation
  const { mutate: submitReview, isLoading: isSubmittingReview } =
    useSubmitReview();

  // Fetch product on mount
  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        await dispatch(fetchProduct(slug));
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin sản phẩm",
          variant: "destructive",
        });
      }
    };
    loadProduct();
  }, [slug, dispatch, toast]);

  // Listen for real-time review updates
  useEffect(() => {
    if (!socket || !slug) return;

    const handleNewReview = (data: any) => {
      if (data.productSlug === slug) {
        queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
        toast({
          title: "Đánh giá mới",
          description: "Có đánh giá mới cho sản phẩm này",
        });
      }
    };

    const handleReviewReply = (data: any) => {
      if (data.productSlug === slug) {
        queryClient.invalidateQueries({ queryKey: ["reviews", slug] });
      }
    };

    socket.on("review:created", handleNewReview);
    socket.on("review:reply:added", handleReviewReply);

    return () => {
      socket.off("review:created", handleNewReview);
      socket.off("review:reply:added", handleReviewReply);
    };
  }, [socket, slug, queryClient, toast]);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!currentProduct) return;

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${currentProduct.name} x ${quantity}`,
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug || !isAuthenticated) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để đánh giá sản phẩm",
        variant: "destructive",
      });
      return;
    }

    if (reviewRating === 0) {
      toast({
        title: "Vui lòng chọn số sao",
        variant: "destructive",
      });
      return;
    }

    if (!reviewContent.trim()) {
      toast({
        title: "Vui lòng điền nội dung đánh giá",
        description: "Nội dung đánh giá không được để trống",
        variant: "destructive",
      });
      return;
    }

    if (reviewContent.trim().length < 10) {
      toast({
        title: "Nội dung quá ngắn",
        description: "Vui lòng viết ít nhất 10 ký tự",
        variant: "destructive",
      });
      return;
    }

    submitReview(
      {
        productSlug: slug,
        params: {
          rating: reviewRating,
          comment: reviewContent,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Cảm ơn bạn đã đánh giá!",
            description: "Đánh giá của bạn đã được gửi thành công.",
          });
          setReviewRating(0);
          setReviewContent("");
          setReviewTitle("");
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Không thể gửi đánh giá";

          if (error.response?.status === 401) {
            toast({
              title: "Phiên đăng nhập hết hạn",
              description: "Vui lòng đăng nhập lại",
              variant: "destructive",
            });
          } else if (
            error.response?.status === 400 &&
            error.response?.data?.message?.includes("đã đánh giá")
          ) {
            toast({
              title: "Bạn đã đánh giá sản phẩm này",
              description:
                "Mỗi người chỉ được đánh giá một lần cho mỗi sản phẩm",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Lỗi",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
      }
    );
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      // TODO: Implement API call to mark review as helpful
      // await axiosClient.post(`/reviews/${reviewId}/helpful`);
      toast({
        title: "Cảm ơn phản hồi",
        description: "Đánh giá của bạn đã được ghi nhận",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi phản hồi",
        variant: "destructive",
      });
    }
  };

  // Use product from API or fallback to loading state
  const product = currentProduct;
  const reviews = reviewsData?.reviews || [];
  const reviewCount = reviewsData?.pagination?.total || 0;

  // Calculate average rating from reviews
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : product?.rating || 0;

  // Check if product is on sale
  const isOnSale =
    product?.originalPrice && product.originalPrice > product.price;
  const discountPercentage =
    isOnSale && product?.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100
        )
      : 0;

  // Prepare images array - use images from API or fallback to default
  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : ["/placeholder.svg"];

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4">
            <Skeleton className="h-6 w-48 mb-8" />
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-semibold mb-4">
              Sản phẩm không tồn tại
            </h1>
            <p className="text-muted-foreground mb-6">
              Không thể tìm thấy sản phẩm bạn yêu cầu.
            </p>
            <Button asChild>
              <Link to="/san-pham">Quay lại danh sách sản phẩm</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {product.name} - {product.brand || "LuxeBeauty"} | LuxeBeauty
        </title>
        <meta name="description" content={product.description || ""} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-28 pb-20">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-foreground transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                to="/san-pham"
                className="hover:text-foreground transition-colors"
              >
                Sản phẩm
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground">{product.name}</span>
            </nav>

            {/* Product Section */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary/30">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {isOnSale && (
                    <span className="absolute top-4 left-4 px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-full">
                      Giảm {discountPercentage}%
                    </span>
                  )}
                  {product.status === "out_of_stock" && (
                    <span className="absolute top-4 left-4 px-4 py-2 bg-muted text-muted-foreground text-sm font-medium rounded-full">
                      Hết hàng
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-accent shadow-soft"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  {product.brand && (
                    <p className="text-accent font-medium tracking-wide uppercase text-sm mb-2">
                      {product.brand}
                    </p>
                  )}
                  <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
                    {product.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? "fill-accent text-accent"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({reviewCount} đánh giá)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-3xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {isOnSale && product.originalPrice && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded-full">
                          -{discountPercentage}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 text-sm">
                  {product.stock > 0 ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {product.stock > 10
                          ? "Còn hàng"
                          : `Còn ${product.stock} sản phẩm`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-destructive font-medium">
                        Hết hàng
                      </span>
                    </>
                  )}
                </div>

                {/* Quantity - Only show if in stock */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Số lượng:
                    </span>
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-3 hover:bg-secondary transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 hover:bg-secondary transition-colors"
                        disabled={quantity >= Math.min(10, product.stock)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="elegant"
                    size="xl"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
                  </Button>
                  <Button
                    variant={isWishlisted ? "rose" : "elegant-outline"}
                    size="xl"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Truck className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Miễn phí ship</p>
                      <p className="text-xs text-muted-foreground">
                        Đơn từ 500K
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Chính hãng</p>
                      <p className="text-xs text-muted-foreground">
                        100% authentic
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Đổi trả</p>
                      <p className="text-xs text-muted-foreground">
                        Trong 7 ngày
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mb-16">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-8">
                <TabsTrigger
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 pb-4"
                >
                  Mô tả sản phẩm
                </TabsTrigger>
                {product.ingredients && (
                  <TabsTrigger
                    value="ingredients"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 pb-4"
                  >
                    Thành phần
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="reviews"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-0 pb-4"
                >
                  Đánh giá ({reviewCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-4">
                <div className="prose prose-neutral max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        product.description || "Chưa có mô tả sản phẩm"
                      ),
                    }}
                  />
                </div>
              </TabsContent>

              {product.ingredients && (
                <TabsContent value="ingredients" className="pt-4">
                  <div className="prose prose-neutral max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(product.ingredients || ""),
                      }}
                    />
                  </div>
                </TabsContent>
              )}

              <TabsContent value="reviews" className="pt-8">
                <div className="grid lg:grid-cols-3 gap-12">
                  {/* Reviews List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif text-2xl font-semibold">
                        Đánh giá từ khách hàng
                      </h3>
                      <Select
                        value={reviewsSort}
                        onValueChange={(value: any) => {
                          setReviewsSort(value);
                          setReviewsPage(1); // Reset to first page when sorting changes
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Mới nhất</SelectItem>
                          <SelectItem value="highest">
                            Đánh giá cao nhất
                          </SelectItem>
                          <SelectItem value="lowest">
                            Đánh giá thấp nhất
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Rating Summary */}
                    <div className="flex items-center gap-6 p-6 bg-secondary/30 rounded-xl">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-foreground">
                          {averageRating.toFixed(1)}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(averageRating)
                                  ? "fill-accent text-accent"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reviewCount} đánh giá
                        </p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const starCount = reviews.filter(
                            (r) => Math.round(r.rating) === star
                          ).length;
                          const percentage =
                            reviewCount > 0
                              ? (starCount / reviewCount) * 100
                              : 0;

                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-sm w-3">{star}</span>
                              <Star className="w-4 h-4 fill-accent text-accent" />
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8 text-right">
                                {starCount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reviews */}
                    {isLoadingReviews ? (
                      <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="p-6 border border-border rounded-xl"
                          >
                            <div className="flex items-start gap-4">
                              <Skeleton className="w-12 h-12 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reviews.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div
                              key={review.id}
                              className="p-6 border border-border rounded-xl"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold">
                                  {review.avatar ||
                                    review.user.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {review.user}
                                    </span>
                                    {review.userId && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Đã mua
                                        hàng
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${
                                            i < review.rating
                                              ? "fill-accent text-accent"
                                              : "fill-muted text-muted"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {review.date ||
                                        new Date(
                                          review.createdAt || ""
                                        ).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground text-sm leading-relaxed">
                                    {review.comment}
                                  </p>
                                  {review.reply && (
                                    <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium text-sm">
                                          Phản hồi từ LuxeBeauty
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {review.replyDate
                                            ? new Date(
                                                review.replyDate
                                              ).toLocaleDateString("vi-VN")
                                            : ""}
                                        </span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {review.reply}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination */}
                        {reviewsData?.pagination &&
                          reviewsData.pagination.last_page > 1 && (
                            <div className="flex justify-center mt-8">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setReviewsPage((prev) =>
                                      Math.max(1, prev - 1)
                                    )
                                  }
                                  disabled={reviewsPage === 1}
                                >
                                  Trước
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                  Trang {reviewsPage} /{" "}
                                  {reviewsData.pagination.last_page}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setReviewsPage((prev) =>
                                      Math.min(
                                        reviewsData.pagination.last_page,
                                        prev + 1
                                      )
                                    )
                                  }
                                  disabled={
                                    reviewsPage ===
                                    reviewsData.pagination.last_page
                                  }
                                >
                                  Sau
                                </Button>
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">
                          Chưa có đánh giá nào cho sản phẩm này.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Hãy là người đầu tiên đánh giá!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Review Form */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-32 p-6 border border-border rounded-xl">
                      <h3 className="font-serif text-xl font-semibold mb-6">
                        Viết đánh giá
                      </h3>
                      {isAuthenticated ? (
                        <form
                          onSubmit={handleSubmitReview}
                          className="space-y-4"
                        >
                          {/* Rating Select */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Đánh giá của bạn *
                            </label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1"
                                  disabled={isSubmittingReview}
                                >
                                  <Star
                                    className={`w-6 h-6 transition-colors ${
                                      star <= reviewRating
                                        ? "fill-accent text-accent"
                                        : "fill-muted text-muted hover:fill-accent/50 hover:text-accent/50"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Nội dung đánh giá *
                            </label>
                            <Textarea
                              value={reviewContent}
                              onChange={(e) => setReviewContent(e.target.value)}
                              placeholder="Chia sẻ trải nghiệm của bạn..."
                              rows={4}
                              maxLength={500}
                              disabled={isSubmittingReview}
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Tối thiểu 10 ký tự
                            </p>
                          </div>

                          <Button
                            type="submit"
                            variant="elegant"
                            className="w-full"
                            disabled={
                              isSubmittingReview ||
                              reviewRating === 0 ||
                              !reviewContent.trim() ||
                              reviewContent.trim().length < 10
                            }
                          >
                            {isSubmittingReview
                              ? "Đang gửi..."
                              : "Gửi đánh giá"}
                          </Button>
                        </form>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            Bạn cần đăng nhập để đánh giá sản phẩm
                          </p>
                          <Button asChild variant="elegant" className="w-full">
                            <Link to="/dang-nhap">Đăng nhập ngay</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
