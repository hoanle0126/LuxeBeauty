<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\ReplyContactRequest;
use App\Http\Resources\ContactMessageResource;
use App\Mail\ContactReply;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class AdminContactController extends Controller
{
    /**
     * Kiểm tra quyền admin
     */
    private function checkAdmin()
    {
        $user = Auth::user();
        
        if (!$user || !$user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return null;
    }

    /**
     * Lấy danh sách contact messages cho admin
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        $perPage = $request->get('per_page', 10);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $query = ContactMessage::query();

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhere('id', $search);
            });
        }

        // Filter by status
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Sort
        $allowedSortFields = ['id', 'name', 'created_at'];
        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $messages = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => ContactMessageResource::collection($messages->items()),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
                'last_page' => $messages->lastPage(),
                'from' => $messages->firstItem(),
                'to' => $messages->lastItem(),
            ],
        ]);
    }

    /**
     * Lấy chi tiết contact message
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ContactMessageResource($message),
        ]);
    }

    /**
     * Cập nhật status của contact message
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        $request->validate([
            'status' => 'required|string|in:pending,replied',
        ]);

        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        $message->status = $request->status;
        if ($request->status === 'replied' && !$message->replied_at) {
            $message->replied_at = now();
        }
        $message->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => new ContactMessageResource($message),
        ]);
    }

    /**
     * Gửi reply cho contact message
     *
     * @param ReplyContactRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function reply(ReplyContactRequest $request, int $id): JsonResponse
    {
        $check = $this->checkAdmin();
        if ($check) {
            return $check;
        }

        $message = ContactMessage::find($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Contact message not found',
            ], 404);
        }

        $validated = $request->validated();

        $message->reply = $validated['reply'];
        $message->status = 'replied';
        if (!$message->replied_at) {
            $message->replied_at = now();
        }
        $message->save();

        // Gửi email reply cho customer
        try {
            Mail::to($message->email)->send(new ContactReply($message, $validated['reply']));
        } catch (\Exception $mailException) {
            // Log lỗi gửi email nhưng không làm fail request
            \Log::error('Failed to send contact reply email: ' . $mailException->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Reply sent successfully',
            'data' => new ContactMessageResource($message),
        ]);
    }
}
