<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Lấy danh sách cart items của user hiện tại
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $cartItems = CartItem::with('product')
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => CartResource::collection($cartItems),
        ]);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     *
     * @param StoreCartItemRequest $request
     * @return JsonResponse
     */
    public function store(StoreCartItemRequest $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Data đã được validated bởi StoreCartItemRequest
        $validated = $request->validated();
        
        $productId = $validated['product_id'];
        $quantity = $validated['quantity'] ?? 1;

        // Kiểm tra product có tồn tại và available không
        $product = Product::find($productId);
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);
        }

        if ($product->status === 'out_of_stock' || $product->status === 'discontinued') {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available',
            ], 400);
        }

        // Kiểm tra stock
        if ($product->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock',
            ], 400);
        }

        // Tìm cart item hiện có hoặc tạo mới
        $cartItem = CartItem::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            // Cập nhật quantity
            $newQuantity = $cartItem->quantity + $quantity;
            
            // Kiểm tra stock lại
            if ($product->stock < $newQuantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock',
                ], 400);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Tạo mới cart item
            $cartItem = CartItem::create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
        }

        $cartItem->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart',
            'data' => new CartResource($cartItem),
        ], 201);
    }

    /**
     * Cập nhật quantity của cart item
     *
     * @param UpdateCartItemRequest $request
     * @param CartItem $cartItem
     * @return JsonResponse
     */
    public function update(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Kiểm tra cart item thuộc về user hiện tại
        if ($cartItem->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
            ], 403);
        }

        // Data đã được validated bởi UpdateCartItemRequest
        $validated = $request->validated();
        
        $quantity = $validated['quantity'];
        $product = $cartItem->product;

        // Kiểm tra stock
        if ($product->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock',
            ], 400);
        }

        $cartItem->quantity = $quantity;
        $cartItem->save();
        $cartItem->load('product');

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated',
            'data' => new CartResource($cartItem),
        ]);
    }

    /**
     * Xóa cart item
     *
     * @param CartItem $cartItem
     * @return JsonResponse
     */
    public function destroy(CartItem $cartItem): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        // Kiểm tra cart item thuộc về user hiện tại
        if ($cartItem->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart item removed',
        ]);
    }

    /**
     * Xóa tất cả cart items của user
     *
     * @return JsonResponse
     */
    public function clear(): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        CartItem::where('user_id', $user->id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }
}
