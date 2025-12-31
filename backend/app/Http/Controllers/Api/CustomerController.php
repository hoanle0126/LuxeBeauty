<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Hash;

class CustomerController extends Controller
{
    /**
     * Lấy danh sách customers
     *
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $customers = User::orderBy('created_at', 'desc')->get();

        // Tính toán totalOrders và totalSpent nếu có Order model
        if (class_exists(\App\Models\Order::class)) {
            $customers = User::withCount('orders as totalOrders')
                ->withSum('orders as totalSpent', 'total')
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Nếu chưa có Order model, set mặc định
            $customers = $customers->map(function ($customer) {
                $customer->totalOrders = 0;
                $customer->totalSpent = 0;
                return $customer;
            });
        }

        return CustomerResource::collection($customers);
    }

    /**
     * Tạo customer mới
     *
     * @param StoreCustomerRequest $request
     * @return JsonResponse
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        // Hash password nếu có
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // Set default status nếu không có
        if (!isset($validated['status'])) {
            $validated['status'] = 'active';
        }

        $customer = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tạo khách hàng thành công',
            'data' => [
                'customer' => new CustomerResource($customer),
            ],
        ], 201);
    }

    /**
     * Lấy thông tin customer theo id
     *
     * @param User $customer
     * @return JsonResponse
     */
    public function show(User $customer): JsonResponse
    {
        // Tính toán totalOrders và totalSpent nếu có Order model
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
     * Cập nhật customer
     *
     * @param UpdateCustomerRequest $request
     * @param User $customer
     * @return JsonResponse
     */
    public function update(UpdateCustomerRequest $request, User $customer): JsonResponse
    {
        $validated = $request->validated();

        // Hash password nếu có
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $customer->update($validated);

        // Tính toán totalOrders và totalSpent nếu có Order model
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
     * Xóa customer
     *
     * @param User $customer
     * @return JsonResponse
     */
    public function destroy(User $customer): JsonResponse
    {
        // Kiểm tra nếu customer có đơn hàng (nếu có Order model)
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

