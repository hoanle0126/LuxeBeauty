import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFeaturedProducts, fetchCategories, fetchBrands, fetchFeaturedBrands, fetchProductsWithFilters, fetchCategoriesPaginated, fetchBrandsPaginated, fetchReviews, submitReview, replyToReview } from "@/lib/api";
import type { Product, Category, Brand, FetchProductsParams, FetchProductsResponse, FetchCategoriesParams, FetchCategoriesResponse, FetchBrandsParams, FetchBrandsResponse, FetchReviewsParams, FetchReviewsResponse, SubmitReviewParams, Review } from "@/lib/api";

// Hook để fetch featured products
export const useFeaturedProducts = () => {
  return useQuery<Product[]>({
    queryKey: ["featuredProducts"],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch categories
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch brands
export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch featured brands (limit 6)
export const useFeaturedBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ["featuredBrands"],
    queryFn: fetchFeaturedBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch products with filters
export const useProductsWithFilters = (params?: FetchProductsParams) => {
  return useQuery<FetchProductsResponse>({
    queryKey: ["products", params],
    queryFn: () => fetchProductsWithFilters(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch categories với pagination và search
export const useCategoriesPaginated = (params?: FetchCategoriesParams) => {
  return useQuery<FetchCategoriesResponse>({
    queryKey: ["categoriesPaginated", params],
    queryFn: () => fetchCategoriesPaginated(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch brands với pagination và search
export const useBrandsPaginated = (params?: FetchBrandsParams) => {
  return useQuery<FetchBrandsResponse>({
    queryKey: ["brandsPaginated", params],
    queryFn: () => fetchBrandsPaginated(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

// Hook để fetch reviews của một sản phẩm
export const useReviews = (productSlug: string, params?: FetchReviewsParams) => {
  return useQuery<FetchReviewsResponse>({
    queryKey: ["reviews", productSlug, params],
    queryFn: () => fetchReviews(productSlug, params),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    enabled: !!productSlug,
  });
};

// Hook để submit review
export const useSubmitReview = () => {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, { productSlug: string; params: SubmitReviewParams }>({
    mutationFn: ({ productSlug, params }) => submitReview(productSlug, params),
    onSuccess: (data, variables) => {
      // Invalidate reviews query để refetch
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productSlug] });
      // Invalidate product query để cập nhật rating
      queryClient.invalidateQueries({ queryKey: ["product", variables.productSlug] });
    },
  });
};

// Hook để reply review (admin only)
export const useReplyReview = () => {
  const queryClient = useQueryClient();

  return useMutation<Review, Error, { productSlug: string; reviewId: number; reply: string }>({
    mutationFn: ({ productSlug, reviewId, reply }) => replyToReview(productSlug, reviewId, reply),
    onSuccess: (data, variables) => {
      // Invalidate reviews query để refetch
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.productSlug] });
    },
  });
};
