<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Promotion\StorePromotionRequest;
use App\Http\Requests\Promotion\UpdatePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Mail\PromotionNotification;
use App\Models\NewsletterSubscription;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AdminPromotionController extends Controller
{
    /**
     * Lấy danh sách tất cả promotions (Admin only)
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

        $query = Promotion::query();

        // Search by code, name
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Filter by type
        if ($request->has('type') && $request->get('type') !== 'all') {
            $query->where('type', $request->get('type'));
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Map frontend sort fields to database fields
        $sortFieldMap = [
            'id' => 'id',
            'code' => 'code',
            'name' => 'name',
            'startDate' => 'start_date',
            'endDate' => 'end_date',
            'status' => 'status',
        ];
        
        $dbSortField = $sortFieldMap[$sortField] ?? 'created_at';
        $query->orderBy($dbSortField, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $promotions = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => PromotionResource::collection($promotions->items()),
            'meta' => [
                'current_page' => $promotions->currentPage(),
                'per_page' => $promotions->perPage(),
                'total' => $promotions->total(),
                'last_page' => $promotions->lastPage(),
                'from' => $promotions->firstItem(),
                'to' => $promotions->lastItem(),
            ],
        ]);
    }

    /**
     * Lấy thông tin promotion theo id (Admin only)
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

        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'success' => false,
                'message' => 'Ưu đãi không tồn tại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new PromotionResource($promotion),
        ]);
    }

    /**
     * Tạo promotion mới (Admin only)
     *
     * @param StorePromotionRequest $request
     * @return JsonResponse
     */
    public function store(StorePromotionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $promotion = Promotion::create([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_order_amount' => $validated['min_order_amount'] ?? null,
            'max_discount_amount' => $validated['max_discount_amount'] ?? null,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'used_count' => 0,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'] ?? 'active',
        ]);

        // Gửi email thông báo cho tất cả subscribers nếu promotion là active
        if ($promotion->status === 'active') {
            $this->sendPromotionEmails($promotion, true);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tạo ưu đãi thành công',
            'data' => new PromotionResource($promotion),
        ], 201);
    }

    /**
     * Cập nhật promotion (Admin only)
     *
     * @param UpdatePromotionRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdatePromotionRequest $request, int $id): JsonResponse
    {
        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'success' => false,
                'message' => 'Ưu đãi không tồn tại',
            ], 404);
        }

        $validated = $request->validated();

        $oldStatus = $promotion->status;
        
        $promotion->update([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_order_amount' => $validated['min_order_amount'] ?? null,
            'max_discount_amount' => $validated['max_discount_amount'] ?? null,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'] ?? $promotion->status,
        ]);

        // Gửi email thông báo nếu promotion được cập nhật và là active
        // Chỉ gửi nếu status thay đổi từ inactive sang active, hoặc đã là active
        if ($promotion->status === 'active' && ($oldStatus !== 'active' || $promotion->wasChanged(['code', 'name', 'value', 'start_date', 'end_date']))) {
            $this->sendPromotionEmails($promotion, false);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật ưu đãi thành công',
            'data' => new PromotionResource($promotion),
        ]);
    }

    /**
     * Xóa promotion (Admin only)
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

        $promotion = Promotion::find($id);

        if (!$promotion) {
            return response()->json([
                'success' => false,
                'message' => 'Ưu đãi không tồn tại',
            ], 404);
        }

        // Kiểm tra nếu promotion đã được sử dụng
        if ($promotion->used_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa ưu đãi đã được sử dụng',
            ], 422);
        }

        $promotion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa ưu đãi thành công',
        ]);
    }

    /**
     * Gửi email thông báo promotion cho tất cả subscribers
     *
     * @param Promotion $promotion
     * @param bool $isNew
     * @return void
     */
    private function sendPromotionEmails(Promotion $promotion, bool $isNew = true): void
    {
        try {
            // Chỉ gửi email nếu promotion là active và trong thời gian hiệu lực
            if ($promotion->status !== 'active') {
                return;
            }

            $now = now();
            if ($now < $promotion->start_date || $now > $promotion->end_date) {
                return;
            }

            // Lấy tất cả email đã đăng ký và active
            $subscribers = NewsletterSubscription::active()->get();

            if ($subscribers->isEmpty()) {
                return;
            }

            // Gửi email cho từng subscriber (sử dụng queue nếu có)
            foreach ($subscribers as $subscriber) {
                try {
                    Mail::to($subscriber->email)->send(new PromotionNotification($promotion, $isNew));
                } catch (\Exception $e) {
                    // Log lỗi nhưng tiếp tục gửi cho các email khác
                    Log::error("Failed to send promotion email to {$subscriber->email}: " . $e->getMessage());
                }
            }

            Log::info("Sent promotion notification emails to {$subscribers->count()} subscribers for promotion: {$promotion->code}");
        } catch (\Exception $e) {
            // Log lỗi nhưng không làm fail request
            Log::error('Failed to send promotion emails: ' . $e->getMessage());
        }
    }
}
