<?php

use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Models\Brand;
use App\Http\Resources\BrandResource;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use App\Models\Product;
use App\Http\Resources\ProductResource;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Các routes API cho ứng dụng ecommerce
| Tất cả routes ở đây đều có prefix /api và middleware api
|
*/

// User profile routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile', [\App\Http\Controllers\Api\UserController::class, 'updateProfile']);
});

// Get authenticated user (for socket authentication)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    try {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $user->load('roles');
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'avatar' => $user->avatar,
            'status' => $user->status,
            'roles' => $user->roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                ];
            }),
        ]);
    } catch (\Exception $e) {
        \Log::error('Socket authentication error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Authentication failed',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
        ], 500);
    }
});

// User routes
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/{user}', [UserController::class, 'show']);
    Route::put('/{user}', [UserController::class, 'update']);
    Route::delete('/{user}', [UserController::class, 'destroy']);
});

// Category routes
Route::prefix('categories')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\CategoryController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\CategoryController::class, 'store']);
    Route::get('/{category:slug}', [\App\Http\Controllers\Api\CategoryController::class, 'show']);
    Route::put('/{category:slug}', [\App\Http\Controllers\Api\CategoryController::class, 'update']);
    Route::delete('/{category:slug}', [\App\Http\Controllers\Api\CategoryController::class, 'destroy']);
});

// Brand routes
Route::prefix('brands')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\BrandController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\BrandController::class, 'store']);
    Route::get('/{brand:slug}', [\App\Http\Controllers\Api\BrandController::class, 'show']);
    Route::put('/{brand:slug}', [\App\Http\Controllers\Api\BrandController::class, 'update']);
    Route::delete('/{brand:slug}', [\App\Http\Controllers\Api\BrandController::class, 'destroy']);
});

// Product routes
Route::prefix('products')->group(function () {
    Route::get('/landing-page', [\App\Http\Controllers\Api\ProductController::class, 'landingPage']);
    Route::get('/stats', [\App\Http\Controllers\Api\ProductController::class, 'stats']);
    Route::get('/', [\App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\ProductController::class, 'store']);
    Route::get('/{product:slug}', [\App\Http\Controllers\Api\ProductController::class, 'show']);
    Route::put('/{product:slug}', [\App\Http\Controllers\Api\ProductController::class, 'update']);
    Route::delete('/{product:slug}', [\App\Http\Controllers\Api\ProductController::class, 'destroy']);
    
    // Review routes
    Route::get('/{product:slug}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'index']);
    Route::post('/{product:slug}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store'])->middleware('auth:sanctum');
    Route::post('/{product:slug}/reviews/{reviewId}/reply', [\App\Http\Controllers\Api\ReviewController::class, 'reply'])->middleware('auth:sanctum');
});

// Customer routes
Route::prefix('customers')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\CustomerController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\CustomerController::class, 'store']);
    Route::get('/{customer}', [\App\Http\Controllers\Api\CustomerController::class, 'show']);
    Route::put('/{customer}', [\App\Http\Controllers\Api\CustomerController::class, 'update']);
    Route::delete('/{customer}', [\App\Http\Controllers\Api\CustomerController::class, 'destroy']);
});

// Cart routes (require authentication)
Route::prefix('cart')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\CartController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\CartController::class, 'store']);
    Route::put('/{cartItem}', [\App\Http\Controllers\Api\CartController::class, 'update']);
    Route::delete('/{cartItem}', [\App\Http\Controllers\Api\CartController::class, 'destroy']);
    Route::delete('/', [\App\Http\Controllers\Api\CartController::class, 'clear']);
});

// Products routes (sẽ thêm sau)
// Route::prefix('products')->group(function () {
//     Route::get('/', [ProductController::class, 'index']);
//     Route::get('/{product}', [ProductController::class, 'show']);
//     Route::post('/', [ProductController::class, 'store'])->middleware('auth');
//     Route::put('/{product}', [ProductController::class, 'update'])->middleware('auth');
//     Route::delete('/{product}', [ProductController::class, 'destroy'])->middleware('auth');
// });

// Orders routes (require authentication)
Route::prefix('orders')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\OrderController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
    Route::post('/{id}/cancel', [\App\Http\Controllers\Api\OrderController::class, 'cancel']);
});

// Admin Orders routes (require authentication + admin role)
Route::prefix('admin/orders')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\AdminOrderController::class, 'index']);
    Route::get('/{id}', [\App\Http\Controllers\Api\AdminOrderController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\AdminOrderController::class, 'update']);
    Route::put('/{id}/status', [\App\Http\Controllers\Api\AdminOrderController::class, 'updateStatus']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\AdminOrderController::class, 'destroy']);
});

// Admin Dashboard routes (require authentication + admin role)
Route::prefix('admin/dashboard')->middleware('auth:sanctum')->group(function () {
    Route::get('/stats', [\App\Http\Controllers\Api\AdminDashboardController::class, 'stats']);
    Route::get('/revenue-chart', [\App\Http\Controllers\Api\AdminDashboardController::class, 'revenueChart']);
    Route::get('/orders-chart', [\App\Http\Controllers\Api\AdminDashboardController::class, 'ordersChart']);
    Route::get('/top-products', [\App\Http\Controllers\Api\AdminDashboardController::class, 'topProducts']);
    Route::get('/recent-orders', [\App\Http\Controllers\Api\AdminDashboardController::class, 'recentOrders']);
});

// Public Promotion routes (no authentication required)
Route::prefix('promotions')->group(function () {
    Route::post('/validate', [\App\Http\Controllers\Api\PromotionController::class, 'validateCode']);
});

// Public Newsletter routes (no authentication required)
Route::prefix('newsletter')->group(function () {
    Route::post('/subscribe', [\App\Http\Controllers\Api\NewsletterController::class, 'subscribe']);
});

// Admin Promotions routes (require authentication + admin role)
Route::prefix('admin/promotions')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\AdminPromotionController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\AdminPromotionController::class, 'store']);
    Route::get('/{id}', [\App\Http\Controllers\Api\AdminPromotionController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\AdminPromotionController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\AdminPromotionController::class, 'destroy']);
});

// Admin Customers routes (require authentication + admin role)
Route::prefix('admin/customers')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\AdminCustomerController::class, 'index']);
    Route::get('/{id}', [\App\Http\Controllers\Api\AdminCustomerController::class, 'show']);
    Route::put('/{id}', [\App\Http\Controllers\Api\AdminCustomerController::class, 'update']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\AdminCustomerController::class, 'destroy']);
});

// Public Settings routes (no authentication required)
Route::prefix('settings')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\SettingsController::class, 'index']);
});

// Contact routes (no authentication required)
Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'store']);

// Admin Settings routes (require authentication + admin role)
Route::prefix('admin/settings')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\AdminSettingsController::class, 'index']);
    Route::get('/{key}', [\App\Http\Controllers\Api\AdminSettingsController::class, 'show']);
    Route::put('/', [\App\Http\Controllers\Api\AdminSettingsController::class, 'update']);
    Route::put('/{key}', [\App\Http\Controllers\Api\AdminSettingsController::class, 'updateSetting']);
});

// Admin Notifications routes (require authentication + admin role)
Route::prefix('admin/notifications')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
    Route::put('/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::put('/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
});

// Admin Contact/Support routes (require authentication + admin role)
Route::prefix('admin/support')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\AdminContactController::class, 'index']);
    Route::get('/{id}', [\App\Http\Controllers\Api\AdminContactController::class, 'show']);
    Route::put('/{id}/status', [\App\Http\Controllers\Api\AdminContactController::class, 'updateStatus']);
    Route::post('/{id}/reply', [\App\Http\Controllers\Api\AdminContactController::class, 'reply']);
});

// Route for bulk brand addition
Route::post("/add-brands", function (\Illuminate\Http\Request $request) {
    $requestData = $request->json()->all();
    
    // Kiểm tra format dữ liệu: {"data": [...]} hoặc array trực tiếp
    if (isset($requestData['data']) && is_array($requestData['data'])) {
        // Format: {"data": [...]}
        $brandsData = $requestData['data'];
    } elseif (is_array($requestData) && isset($requestData[0]) && is_array($requestData[0])) {
        // Format: array trực tiếp [...]
        $brandsData = $requestData;
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Invalid data format. Expected {"data": [...]} or array of brands.',
        ], 400);
    }
    
    $created = [];
    $skipped = [];
    $errors = [];
    
    foreach ($brandsData as $data) {
        $validator = Validator::make($data, [
            'id' => 'nullable|integer|min:1',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ]);
        
        if ($validator->fails()) {
            $errors[] = ['data' => $data, 'errors' => $validator->errors()->toArray()];
            continue;
        }
        
        $validated = $validator->validated();
        
        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        // Check for existing brand by id, slug or name
        $existingBrand = null;
        if (isset($validated['id'])) {
            $existingBrand = Brand::find($validated['id']);
        }
        
        if (!$existingBrand) {
            $existingBrand = Brand::where('slug', $validated['slug'])
                                  ->orWhere('name', $validated['name'])
                                  ->first();
        }
        
        if ($existingBrand) {
            $skipped[] = ['data' => $data, 'reason' => 'Brand already exists'];
            continue;
        }
        
        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }
        
        try {
            // Tạo brand với tất cả dữ liệu bao gồm id nếu có
            $brand = Brand::create($validated);
            $created[] = new BrandResource($brand);
        } catch (\Exception $e) {
            $errors[] = ['data' => $data, 'errors' => $e->getMessage()];
        }
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Brand import process completed.',
        'summary' => [
            'total_processed' => count($brandsData),
            'created_count' => count($created),
            'skipped_count' => count($skipped),
            'error_count' => count($errors),
        ],
        'data' => [
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors,
        ],
    ]);
});

// Route for bulk category addition
Route::post("/add-categories", function (\Illuminate\Http\Request $request) {
    $requestData = $request->json()->all();
    
    // Kiểm tra format dữ liệu: {"data": [...]} hoặc array trực tiếp
    if (isset($requestData['data']) && is_array($requestData['data'])) {
        // Format: {"data": [...]}
        $categoriesData = $requestData['data'];
    } elseif (is_array($requestData) && isset($requestData[0]) && is_array($requestData[0])) {
        // Format: array trực tiếp [...]
        $categoriesData = $requestData;
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Invalid data format. Expected {"data": [...]} or array of categories.',
        ], 400);
    }
    
    $created = [];
    $skipped = [];
    $errors = [];
    
    foreach ($categoriesData as $data) {
        $validator = Validator::make($data, [
            'id' => 'nullable|integer|min:1',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'thumbnail' => 'nullable|string|max:500',
            'description' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ]);
        
        if ($validator->fails()) {
            $errors[] = ['data' => $data, 'errors' => $validator->errors()->toArray()];
            continue;
        }
        
        $validated = $validator->validated();
        
        // Generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        // Check for existing category by id, slug or name
        $existingCategory = null;
        if (isset($validated['id'])) {
            $existingCategory = Category::find($validated['id']);
        }
        
        if (!$existingCategory) {
            $existingCategory = Category::where('slug', $validated['slug'])
                                      ->orWhere('name', $validated['name'])
                                      ->first();
        }
        
        if ($existingCategory) {
            $skipped[] = ['data' => $data, 'reason' => 'Category already exists'];
            continue;
        }
        
        // Set default status if not provided
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }
        
        try {
            // Tạo category với tất cả dữ liệu bao gồm id nếu có
            $category = Category::create($validated);
            $created[] = new CategoryResource($category);
        } catch (\Exception $e) {
            $errors[] = ['data' => $data, 'errors' => $e->getMessage()];
        }
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Category import process completed.',
        'summary' => [
            'total_processed' => count($categoriesData),
            'created_count' => count($created),
            'skipped_count' => count($skipped),
            'error_count' => count($errors),
        ],
        'data' => [
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors,
        ],
    ]);
});

// Route for bulk product addition
Route::post("/add-products", function (\Illuminate\Http\Request $request) {
    // Tăng thời gian execution để xử lý dữ liệu lớn
    set_time_limit(300); // 5 phút
    
    $requestData = $request->json()->all();
    
    // Kiểm tra format dữ liệu: {"data": [...]} hoặc array trực tiếp
    if (isset($requestData['data']) && is_array($requestData['data'])) {
        // Format: {"data": [...]}
        $productsData = $requestData['data'];
    } elseif (is_array($requestData) && isset($requestData[0]) && is_array($requestData[0])) {
        // Format: array trực tiếp [...]
        $productsData = $requestData;
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Invalid data format. Expected {"data": [...]} or array of products.',
        ], 400);
    }
    
    $created = [];
    $skipped = [];
    $errors = [];
    
    // Cache existing products để tránh query nhiều lần
    $existingIds = Product::pluck('id')->toArray();
    $existingSlugs = Product::pluck('slug')->toArray();
    $existingNames = Product::pluck('name')->toArray();
    
    // Sử dụng transaction để tăng tốc độ
    \DB::beginTransaction();
    
    try {
        foreach ($productsData as $index => $data) {
            // Validate dữ liệu
            $validator = Validator::make($data, [
                'id' => 'nullable|integer|min:1',
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255',
                'category_id' => 'required|integer|exists:categories,id',
                'brand_id' => 'nullable|integer|exists:brands,id',
                'price' => 'required|numeric|min:0',
                'original_price' => 'nullable|numeric|min:0',
                'stock' => 'nullable|integer|min:0',
                'description' => 'nullable|string',
                'ingredients' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'nullable|string|max:500',
                'status' => 'nullable|in:available,low_stock,out_of_stock,discontinued',
            ]);
            
            if ($validator->fails()) {
                $errors[] = ['data' => $data, 'errors' => $validator->errors()->toArray()];
                continue;
            }
            
            $validated = $validator->validated();
            
            // Generate slug if not provided
            if (empty($validated['slug'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }
            
            // Check for existing product bằng cache thay vì query
            $isExisting = false;
            if (isset($validated['id']) && in_array($validated['id'], $existingIds)) {
                $isExisting = true;
            } elseif (in_array($validated['slug'], $existingSlugs)) {
                $isExisting = true;
            } elseif (in_array($validated['name'], $existingNames)) {
                $isExisting = true;
            }
            
            if ($isExisting) {
                $skipped[] = ['data' => $data, 'reason' => 'Product already exists'];
                continue;
            }
            
            // Set default values if not provided
            if (!isset($validated['stock'])) {
                $validated['stock'] = 0;
            }
            
            if (!isset($validated['status'])) {
                $validated['status'] = 'available';
            }
            
            // Ensure images is an array (can be null or empty array)
            if (!isset($validated['images']) || !is_array($validated['images'])) {
                $validated['images'] = [];
            }
            
            try {
                // Tạo product với tất cả dữ liệu bao gồm id nếu có
                $product = Product::create($validated);
                
                // Cập nhật cache
                if (isset($validated['id'])) {
                    $existingIds[] = $validated['id'];
                }
                $existingSlugs[] = $validated['slug'];
                $existingNames[] = $validated['name'];
                
                // Chỉ load relationships khi cần thiết (không load trong vòng lặp để tăng tốc)
                $created[] = [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                ];
            } catch (\Exception $e) {
                $errors[] = ['data' => $data, 'errors' => $e->getMessage()];
            }
        }
        
        \DB::commit();
    } catch (\Exception $e) {
        \DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Error processing products: ' . $e->getMessage(),
        ], 500);
    }
    
    return response()->json([
        'success' => true,
        'message' => 'Product import process completed.',
        'summary' => [
            'total_processed' => count($productsData),
            'created_count' => count($created),
            'skipped_count' => count($skipped),
            'error_count' => count($errors),
        ],
        'data' => [
            'created' => $created,
            'skipped' => $skipped,
            'errors' => $errors,
        ],
    ]);
});