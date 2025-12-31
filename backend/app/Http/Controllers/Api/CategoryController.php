<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách categories với pagination
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perPage = request()->get('per_page', 5);
        $page = request()->get('page', 1);
        $search = request()->get('search', '');
        $sortField = request()->get('sort_field', 'id');
        $sortOrder = request()->get('sort_order', 'asc');

        $query = Category::query()->withCount('products');

        // Search by name or slug
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Sort
        $allowedSortFields = ['id', 'name', 'created_at'];
        if ($sortField === 'product_count') {
            // Sort by product count using withCount
            $query->orderBy('products_count', $sortOrder);
        } elseif (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->orderBy('id', $sortOrder);
        }

        // Paginate
        $categories = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories->items()),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'last_page' => $categories->lastPage(),
                'from' => $categories->firstItem(),
                'to' => $categories->lastItem(),
            ],
        ]);
    }

    /**
     * Tạo category mới
     *
     * @param StoreCategoryRequest $request
     * @return JsonResponse
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Set default status nếu không có
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tạo danh mục thành công',
            'data' => [
                'category' => new CategoryResource($category),
            ],
        ], 201);
    }

    /**
     * Lấy thông tin category theo slug
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function show(Category $category): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'category' => new CategoryResource($category),
            ],
        ]);
    }

    /**
     * Cập nhật category
     *
     * @param UpdateCategoryRequest $request
     * @param Category $category
     * @return JsonResponse
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $validated = $request->validated();

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data' => [
                'category' => new CategoryResource($category),
            ],
        ]);
    }

    /**
     * Xóa category
     *
     * @param Category $category
     * @return JsonResponse
     */
    public function destroy(Category $category): JsonResponse
    {
        // Tạm thời bỏ qua kiểm tra products vì Product model chưa được tạo
        // if ($category->products()->count() > 0) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Không thể xóa danh mục vì còn sản phẩm trong danh mục này',
        //     ], 422);
        // }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa danh mục thành công',
        ]);
    }
}

