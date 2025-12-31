<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Lấy danh sách products với pagination và filters
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perPage = request()->get('per_page', 12);
        $page = request()->get('page', 1);
        $search = request()->get('search', '');
        $sortField = request()->get('sort_field', 'created_at');
        $sortOrder = request()->get('sort_order', 'desc');
        $categoryFilter = request()->get('category', '');
        $brandFilter = request()->get('brand', '');
        $priceMin = request()->get('priceMin');
        $priceMax = request()->get('priceMax');
        $statusFilter = request()->get('status', 'available');

        $query = Product::with(['category', 'brand']);

        // Only show available products by default for public API
        $query->where('status', 'available');

        // Search by name, category, brand
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('brand', function ($brandQuery) use ($search) {
                      $brandQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by category (accepts both name and slug)
        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->whereHas('category', function ($catQuery) use ($categoryFilter) {
                $catQuery->where('name', $categoryFilter)
                         ->orWhere('slug', $categoryFilter);
            });
        }

        // Filter by brand (accepts both name and slug)
        if ($brandFilter && $brandFilter !== 'all') {
            $query->whereHas('brand', function ($brandQuery) use ($brandFilter) {
                $brandQuery->where('name', $brandFilter)
                           ->orWhere('slug', $brandFilter);
            });
        }

        // Filter by price range
        if ($priceMin !== null && $priceMin !== '') {
            $query->where('price', '>=', (float) $priceMin);
        }
        if ($priceMax !== null && $priceMax !== '') {
            $query->where('price', '<=', (float) $priceMax);
        }

        // Filter by status (for admin use)
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Sort options
        $allowedSortFields = ['id', 'name', 'price', 'stock', 'created_at', 'updated_at'];
        $sortMapping = [
            'newest' => ['field' => 'created_at', 'order' => 'desc'],
            'price-asc' => ['field' => 'price', 'order' => 'asc'],
            'price-desc' => ['field' => 'price', 'order' => 'desc'],
            'name-asc' => ['field' => 'name', 'order' => 'asc'],
            'name-desc' => ['field' => 'name', 'order' => 'desc'],
        ];

        // Handle special sort cases
        if (isset($sortMapping[$sortField])) {
            $sortConfig = $sortMapping[$sortField];
            $query->orderBy($sortConfig['field'], $sortConfig['order']);
        } elseif (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Paginate
        $products = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
        ]);
    }

    /**
     * Lấy sản phẩm cho landing page (featured, new arrivals, etc.)
     *
     * @return JsonResponse
     */
    public function landingPage(): JsonResponse
    {
        // Featured products (newest available products)
        $featuredProducts = Product::with(['category', 'brand'])
            ->where('status', 'available')
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();

        // New arrivals (last 30 days)
        $newArrivals = Product::with(['category', 'brand'])
            ->where('status', 'available')
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Best sellers (products with most stock - in real app would be based on orders)
        $bestSellers = Product::with(['category', 'brand'])
            ->where('status', 'available')
            ->orderBy('stock', 'desc')
            ->limit(6)
            ->get();

        // On sale products (with original_price > price)
        $onSaleProducts = Product::with(['category', 'brand'])
            ->where('status', 'available')
            ->whereNotNull('original_price')
            ->whereColumn('original_price', '>', 'price')
            ->orderByRaw('(original_price - price) / original_price DESC')
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'featured' => ProductResource::collection($featuredProducts),
                'newArrivals' => ProductResource::collection($newArrivals),
                'bestSellers' => ProductResource::collection($bestSellers),
                'onSale' => ProductResource::collection($onSaleProducts),
            ],
        ]);
    }

    /**
     * Tạo product mới
     *
     * @param StoreProductRequest $request
     * @return JsonResponse
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Map validated data to database columns
        $productData = [
            'name' => $validated['name'],
            'category_id' => $validated['category_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'images' => $validated['images'] ?? null,
            'description' => $validated['description'] ?? null,
            'ingredients' => $validated['ingredients'] ?? null,
            'stock' => $validated['stock'] ?? 0,
            'status' => $validated['status'] ?? 'available',
        ];

        $product = Product::create($productData);

        return response()->json([
            'success' => true,
            'message' => 'Tạo sản phẩm thành công',
            'data' => [
                'product' => new ProductResource($product->load(['category', 'brand'])),
            ],
        ], 201);
    }

    /**
     * Lấy thông tin chi tiết product theo slug
     *
     * @param Product $product
     * @return JsonResponse
     */
    public function show(Product $product): JsonResponse
    {
        // Load relationships
        $product->load(['category', 'brand', 'reviews' => function ($query) {
            $query->where('status', 'approved')
                  ->orderBy('created_at', 'desc')
                  ->limit(10);
        }]);

        // Calculate average rating
        $averageRating = $product->reviews->avg('rating') ?? 0;
        $totalReviews = $product->reviews->count();

        // Get related products (same category or brand)
        $relatedProducts = Product::with(['category', 'brand'])
            ->where('status', 'available')
            ->where('id', '!=', $product->id)
            ->where(function ($query) use ($product) {
                $query->where('category_id', $product->category_id)
                      ->orWhere('brand_id', $product->brand_id);
            })
            ->inRandomOrder()
            ->limit(4)
            ->get();

        // Check if product is on sale
        $isOnSale = $product->original_price && $product->original_price > $product->price;
        $discountPercentage = $isOnSale 
            ? round((($product->original_price - $product->price) / $product->original_price) * 100)
            : 0;

        // Prepare product data with additional info
        $productData = new ProductResource($product);
        $productDataArray = $productData->toArray(request());
        
        // Add additional fields
        $productDataArray['averageRating'] = round($averageRating, 1);
        $productDataArray['totalReviews'] = $totalReviews;
        $productDataArray['isOnSale'] = $isOnSale;
        $productDataArray['discountPercentage'] = $discountPercentage;
        $productDataArray['inStock'] = $product->stock > 0;

        // Prepare reviews data
        $reviewsData = $product->reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'userName' => $review->user?->name ?? 'Khách hàng',
                'rating' => $review->rating,
                'comment' => $review->comment,
                'createdAt' => $review->created_at?->toIso8601String(),
                'reply' => $review->reply,
                'repliedAt' => $review->replied_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $productDataArray,
                'reviews' => $reviewsData,
                'relatedProducts' => ProductResource::collection($relatedProducts),
            ],
        ]);
    }

    /**
     * Cập nhật product
     *
     * @param UpdateProductRequest $request
     * @param Product $product
     * @return JsonResponse
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $validated = $request->validated();

        // Map validated data to database columns
        $productData = [
            'name' => $validated['name'],
            'category_id' => $validated['category_id'] ?? null,
            'brand_id' => $validated['brand_id'] ?? null,
            'price' => $validated['price'],
            'original_price' => $validated['original_price'] ?? null,
            'images' => $validated['images'] ?? null,
            'description' => $validated['description'] ?? null,
            'ingredients' => $validated['ingredients'] ?? null,
            'stock' => $validated['stock'],
            'status' => $validated['status'],
        ];

        $product->update($productData);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => [
                'product' => new ProductResource($product->load(['category', 'brand'])),
            ],
        ]);
    }

    /**
     * Xóa product
     *
     * @param Product $product
     * @return JsonResponse
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa sản phẩm thành công',
        ]);
    }

    /**
     * Lấy thống kê tổng hợp của products
     *
     * @return JsonResponse
     */
    public function stats(): JsonResponse
    {
        $search = request()->get('search', '');
        $statusFilter = request()->get('status', '');
        $categoryFilter = request()->get('category', '');

        $query = Product::query();

        // Search by name, category, brand
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('brand', function ($brandQuery) use ($search) {
                      $brandQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Filter by category
        if ($categoryFilter && $categoryFilter !== 'all') {
            $query->whereHas('category', function ($catQuery) use ($categoryFilter) {
                $catQuery->where('name', $categoryFilter);
            });
        }

        // Get all products matching filters for stats calculation
        $allProducts = $query->get();

        // Calculate stats
        $totalProducts = $allProducts->count();
        $totalStock = $allProducts->sum('stock');
        $totalValue = $allProducts->sum(function ($product) {
            return $product->price * $product->stock;
        });

        // Status counts
        $statusCounts = [
            'all' => $totalProducts,
            'available' => $allProducts->where('status', 'available')->count(),
            'low_stock' => $allProducts->where('status', 'low_stock')->count(),
            'out_of_stock' => $allProducts->where('status', 'out_of_stock')->count(),
            'discontinued' => $allProducts->where('status', 'discontinued')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'totalProducts' => $totalProducts,
                'totalStock' => $totalStock,
                'totalValue' => $totalValue,
                'statusCounts' => $statusCounts,
            ],
        ]);
    }
}

