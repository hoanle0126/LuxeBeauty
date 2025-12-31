<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    /**
     * Lấy danh sách brands với pagination
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

        $query = Brand::query()->withCount('products');

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
        $brands = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => BrandResource::collection($brands->items()),
            'meta' => [
                'current_page' => $brands->currentPage(),
                'per_page' => $brands->perPage(),
                'total' => $brands->total(),
                'last_page' => $brands->lastPage(),
                'from' => $brands->firstItem(),
                'to' => $brands->lastItem(),
            ],
        ]);
    }

    /**
     * Tạo brand mới
     *
     * @param StoreBrandRequest $request
     * @return JsonResponse
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Set default status nếu không có
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tạo thương hiệu thành công',
            'data' => [
                'brand' => new BrandResource($brand),
            ],
        ], 201);
    }

    /**
     * Lấy thông tin brand theo slug
     *
     * @param Brand $brand
     * @return JsonResponse
     */
    public function show(Brand $brand): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'brand' => new BrandResource($brand),
            ],
        ]);
    }

    /**
     * Cập nhật brand
     *
     * @param UpdateBrandRequest $request
     * @param Brand $brand
     * @return JsonResponse
     */
    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $validated = $request->validated();

        $brand->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật thương hiệu thành công',
            'data' => [
                'brand' => new BrandResource($brand),
            ],
        ]);
    }

    /**
     * Xóa brand
     *
     * @param Brand $brand
     * @return JsonResponse
     */
    public function destroy(Brand $brand): JsonResponse
    {
        // Tạm thời bỏ qua kiểm tra products vì Product model chưa được tạo
        // if ($brand->products()->count() > 0) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Không thể xóa thương hiệu vì còn sản phẩm trong thương hiệu này',
        //     ], 422);
        // }

        $brand->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa thương hiệu thành công',
        ]);
    }
}

