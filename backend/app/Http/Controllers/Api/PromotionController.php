<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    /**
     * Validate và tính toán discount cho promotion code
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function validateCode(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
        ]);

        $code = strtoupper(trim($request->input('code')));
        $orderAmount = (float) $request->input('order_amount');

        // Tìm promotion theo code
        $promotion = Promotion::where('code', $code)->first();

        if (!$promotion) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không tồn tại',
            ], 404);
        }

        // Kiểm tra promotion có thể sử dụng không
        if (!$promotion->isUsable()) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không thể sử dụng. Có thể đã hết hạn hoặc đã hết lượt sử dụng.',
            ], 422);
        }

        // Kiểm tra min_order_amount
        if ($promotion->min_order_amount && $orderAmount < $promotion->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => sprintf(
                    'Đơn hàng tối thiểu %s để sử dụng mã này',
                    number_format($promotion->min_order_amount, 0, ',', '.') . ' ₫'
                ),
            ], 422);
        }

        // Tính toán discount
        $discount = $promotion->calculateDiscount($orderAmount);

        return response()->json([
            'success' => true,
            'message' => 'Áp dụng mã giảm giá thành công',
            'data' => [
                'promotion' => new PromotionResource($promotion),
                'discount' => $discount,
                'final_amount' => $orderAmount - $discount,
            ],
        ]);
    }
}

