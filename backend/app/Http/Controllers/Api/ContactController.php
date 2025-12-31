<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\NotificationHelper;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Gửi tin nhắn liên hệ
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|min:2|max:50',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|min:5|max:100',
            'message' => 'required|string|min:10|max:1000',
        ], [
            'name.required' => 'Vui lòng nhập tên',
            'name.min' => 'Tên phải có ít nhất 2 ký tự',
            'name.max' => 'Tên không được vượt quá 50 ký tự',
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không hợp lệ',
            'subject.required' => 'Vui lòng nhập chủ đề',
            'subject.min' => 'Chủ đề phải có ít nhất 5 ký tự',
            'subject.max' => 'Chủ đề không được vượt quá 100 ký tự',
            'message.required' => 'Vui lòng nhập nội dung tin nhắn',
            'message.min' => 'Nội dung tin nhắn phải có ít nhất 10 ký tự',
            'message.max' => 'Nội dung tin nhắn không được vượt quá 1000 ký tự',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Lưu tin nhắn
        $contactMessage = ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        // Tạo notification cho admin
        try {
            NotificationHelper::createAdminNotification(
                'support_message',
                'Tin nhắn hỗ trợ mới',
                "Tin nhắn từ {$validated['name']} ({$validated['email']}): {$validated['subject']}",
                [
                    'contact_message_id' => $contactMessage->id,
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'subject' => $validated['subject'],
                ]
            );
        } catch (\Exception $e) {
            // Log lỗi nhưng không làm fail request
            \Log::error('Failed to create notification for contact message: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Gửi tin nhắn thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.',
            'data' => [
                'id' => $contactMessage->id,
            ],
        ], 201);
    }
}
