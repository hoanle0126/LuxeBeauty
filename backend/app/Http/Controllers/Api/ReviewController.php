<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Helpers\NotificationHelper;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Lấy danh sách reviews của một sản phẩm
     *
     * @param string $slug Product slug
     * @return JsonResponse
     */
    public function index(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại',
            ], 404);
        }

        $perPage = request()->get('per_page', 5);
        $page = request()->get('page', 1);

        $reviews = Review::with('user')
            ->where('product_id', $product->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'last_page' => $reviews->lastPage(),
                'from' => $reviews->firstItem(),
                'to' => $reviews->lastItem(),
            ],
        ]);
    }

    /**
     * Tạo review mới cho sản phẩm
     *
     * @param StoreReviewRequest $request
     * @param string $slug Product slug
     * @return JsonResponse
     */
    public function store(StoreReviewRequest $request, string $slug): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại',
            ], 404);
        }

        // Kiểm tra xem user đã review sản phẩm này chưa
        $existingReview = Review::where('product_id', $product->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn đã đánh giá sản phẩm này rồi',
            ], 400);
        }

        $validated = $request->validated();

        try {
            DB::beginTransaction();

            $review = Review::create([
                'product_id' => $product->id,
                'user_id' => $user->id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            DB::commit();

            // Tạo notification cho admin
            try {
                NotificationHelper::createAdminNotification(
                    'product_review',
                    'Đánh giá sản phẩm mới',
                    "Khách hàng {$user->name} đã đánh giá sản phẩm '{$product->name}' với {$validated['rating']} sao",
                    [
                        'review_id' => $review->id,
                        'product_id' => $product->id,
                        'product_slug' => $product->slug,
                        'product_name' => $product->name,
                        'user_id' => $user->id,
                        'user_name' => $user->name,
                        'rating' => $validated['rating'],
                        'comment' => $validated['comment'],
                    ]
                );
            } catch (\Exception $e) {
                // Log lỗi nhưng không làm fail request
                \Log::error('Failed to create notification for new review: ' . $e->getMessage());
            }

            $review->load('user');

            // Emit socket event để cập nhật realtime cho tất cả users đang xem sản phẩm này
            try {
                $socketUrl = config('app.socket_url', env('SOCKET_URL', 'http://localhost:3001'));
                
                Http::timeout(2)->post("{$socketUrl}/api/notify", [
                    'room' => 'all', // Broadcast to all users
                    'event' => 'review:created',
                    'data' => [
                        'productSlug' => $product->slug,
                        'review' => (new ReviewResource($review))->toArray(request()),
                    ],
                ]);
            } catch (\Exception $e) {
                // Log lỗi nhưng không làm fail request
                Log::error('Failed to emit socket event for new review: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Đánh giá thành công',
                'data' => new ReviewResource($review),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo đánh giá',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Admin reply review
     *
     * @param Request $request
     * @param string $slug Product slug
     * @param int $reviewId Review ID
     * @return JsonResponse
     */
    public function reply(Request $request, string $slug, int $reviewId): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $product = Product::where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại',
            ], 404);
        }

        $review = Review::where('product_id', $product->id)
            ->where('id', $reviewId)
            ->first();

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Đánh giá không tồn tại',
            ], 404);
        }

        $request->validate([
            'reply' => 'required|string|min:10|max:2000',
        ]);

        try {
            $review->update([
                'reply' => $request->reply,
                'replied_at' => now(),
            ]);

            $review->load('user');

            // Emit socket event để cập nhật realtime cho tất cả users đang xem sản phẩm này
            try {
                $socketUrl = config('app.socket_url', env('SOCKET_URL', 'http://localhost:3001'));
                
                Http::timeout(2)->post("{$socketUrl}/api/notify", [
                    'room' => 'all', // Broadcast to all users
                    'event' => 'review:reply:added',
                    'data' => [
                        'productSlug' => $product->slug,
                        'reviewId' => $review->id,
                        'review' => (new ReviewResource($review))->toArray(request()),
                    ],
                ]);
            } catch (\Exception $e) {
                // Log lỗi nhưng không làm fail request
                Log::error('Failed to emit socket event for review reply: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Phản hồi thành công',
                'data' => new ReviewResource($review),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi phản hồi',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }
}
