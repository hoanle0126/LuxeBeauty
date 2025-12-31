<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Helpers\NotificationHelper;
use App\Mail\OrderConfirmation;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng của user hiện tại
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $orders = Order::with('items')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
                'last_page' => $orders->lastPage(),
                'from' => $orders->firstItem(),
                'to' => $orders->lastItem(),
            ],
        ]);
    }

    /**
     * Tạo đơn hàng mới từ giỏ hàng
     *
     * @param StoreOrderRequest $request
     * @return JsonResponse
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Data đã được validated bởi StoreOrderRequest
        $validated = $request->validated();

        // Lấy cart items của user
        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng trống',
            ], 400);
        }

        // Kiểm tra stock và tính toán tổng
        $subtotal = 0;
        $orderItemsData = [];

        foreach ($cartItems as $cartItem) {
            $product = $cartItem->product;
            
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm không tồn tại: ID {$cartItem->product_id}",
                ], 400);
            }

            if ($product->stock < $cartItem->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Sản phẩm '{$product->name}' không đủ số lượng. Còn lại: {$product->stock}",
                ], 400);
            }

            $itemSubtotal = $product->price * $cartItem->quantity;
            $subtotal += $itemSubtotal;

            $orderItemsData[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_price' => $product->price,
                'product_image' => $product->images && count($product->images) > 0 ? $product->images[0] : null,
                'quantity' => $cartItem->quantity,
                'subtotal' => $itemSubtotal,
            ];
        }

        $shippingFee = $request->get('shipping_fee', 0);
        $total = $subtotal + $shippingFee;

        // Tạo đơn hàng trong transaction
        try {
            DB::beginTransaction();

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'total' => $total,
                'payment_method' => $validated['payment_method'] ?? 'cod',
                'payment_status' => 'pending',
                'shipping_name' => $validated['shipping_name'],
                'shipping_email' => $validated['shipping_email'] ?? null,
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'] ?? null,
                'shipping_district' => $validated['shipping_district'] ?? null,
                'shipping_ward' => $validated['shipping_ward'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            // Tạo order items và cập nhật stock
            foreach ($orderItemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    ...$itemData,
                ]);

                // Giảm stock
                Product::where('id', $itemData['product_id'])
                    ->decrement('stock', $itemData['quantity']);
            }

            // Xóa cart items
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            $order->load('items');

            // Gửi email xác nhận đơn hàng
            try {
                $customerEmail = $validated['shipping_email'] ?? null;
                if ($customerEmail) {
                    Mail::to($customerEmail)->send(new OrderConfirmation($order, $customerEmail));
                }
            } catch (\Exception $mailException) {
                // Log lỗi gửi email nhưng không làm fail request
                \Log::error('Failed to send order confirmation email: ' . $mailException->getMessage());
            }

            // Tạo notification cho admin
            try {
                NotificationHelper::createAdminNotification(
                    'order_created',
                    'Đơn hàng mới',
                    "Đơn hàng #{$order->order_number} từ {$validated['shipping_name']} với tổng tiền " . number_format($total, 0, ',', '.') . ' VNĐ',
                    [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer_name' => $validated['shipping_name'],
                        'customer_email' => $validated['shipping_email'] ?? null,
                        'total' => $total,
                    ]
                );
            } catch (\Exception $e) {
                // Log lỗi nhưng không làm fail request
                \Log::error('Failed to create notification for new order: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Đặt hàng thành công',
                'data' => new OrderResource($order),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy chi tiết đơn hàng
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $order = Order::with('items.product')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không tồn tại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Hủy đơn hàng (chỉ cho phép khi status là pending)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function cancel(int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $order = Order::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng không tồn tại',
            ], 404);
        }

        // Chỉ cho phép hủy khi status là pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể hủy đơn hàng ở trạng thái "Chờ xác nhận"',
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Cập nhật status thành cancelled
            $order->status = 'cancelled';
            $order->save();

            // Hoàn lại stock cho các sản phẩm
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }

            DB::commit();

            $order->load('items');

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy đơn hàng thành công',
                'data' => new OrderResource($order),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi hủy đơn hàng',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
