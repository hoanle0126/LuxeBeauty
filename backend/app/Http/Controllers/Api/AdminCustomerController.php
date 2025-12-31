<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminCustomerController extends Controller
{
    /**
     * Lấy danh sách tất cả customers (Admin only)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Chỉ lấy users có role "user", không bao gồm admin
        // Sử dụng guard 'web' vì roles được tạo với guard 'web'
        $query = User::role('user', 'web');

        // Tính toán totalOrders và totalSpent
        if (class_exists(\App\Models\Order::class)) {
            $query->withCount('orders as totalOrders')
                ->withSum('orders as totalSpent', 'total');
        }

        // Search by name, email, phone, or id
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Map frontend sort fields to database fields
        $sortFieldMap = [
            'id' => 'id',
            'name' => 'name',
            'totalOrders' => 'totalOrders',
            'totalSpent' => 'totalSpent',
            'joinedDate' => 'created_at',
        ];
        
        $dbSortField = $sortFieldMap[$sortField] ?? 'created_at';
        $query->orderBy($dbSortField, $sortOrder);

        $customers = $query->get();

        return response()->json([
            'success' => true,
            'data' => CustomerResource::collection($customers),
        ]);
    }

    /**
     * Lấy thông tin customer theo id (Admin only)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Chỉ lấy user có role "user" với guard 'web'
        $customer = User::role('user', 'web')->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Khách hàng không tồn tại',
            ], 404);
        }

        // Tính toán totalOrders và totalSpent
        if (class_exists(\App\Models\Order::class)) {
            $customer->loadCount('orders as totalOrders')
                ->loadSum('orders as totalSpent', 'total');
        } else {
            $customer->totalOrders = 0;
            $customer->totalSpent = 0;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'customer' => new CustomerResource($customer),
            ],
        ]);
    }

    /**
     * Cập nhật customer (Admin only)
     *
     * @param UpdateCustomerRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateCustomerRequest $request, int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Chỉ lấy user có role "user" với guard 'web'
        $customer = User::role('user', 'web')->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Khách hàng không tồn tại',
            ], 404);
        }

        // Data đã được validated bởi UpdateCustomerRequest
        $validated = $request->validated();

        // Hash password nếu có
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $customer->update($validated);

        // Tính toán totalOrders và totalSpent
        if (class_exists(\App\Models\Order::class)) {
            $customer->loadCount('orders as totalOrders')
                ->loadSum('orders as totalSpent', 'total');
        } else {
            $customer->totalOrders = 0;
            $customer->totalSpent = 0;
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật khách hàng thành công',
            'data' => [
                'customer' => new CustomerResource($customer),
            ],
        ]);
    }

    /**
     * Xóa customer (Admin only)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        // Chỉ lấy user có role "user" với guard 'web'
        $customer = User::role('user', 'web')->find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Khách hàng không tồn tại',
            ], 404);
        }

        // Kiểm tra nếu customer có đơn hàng
        if (class_exists(\App\Models\Order::class) && $customer->orders()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa khách hàng vì còn đơn hàng',
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa khách hàng thành công',
        ]);
    }
}

