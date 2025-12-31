<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\NotificationHelper;
use App\Mail\NewsletterSubscriptionConfirmation;
use App\Models\NewsletterSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * Đăng ký nhận tin giảm giá
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ], [
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không hợp lệ',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = strtolower(trim($request->input('email')));

        // Kiểm tra xem email đã đăng ký chưa
        $existing = NewsletterSubscription::where('email', $email)->first();

        if ($existing) {
            // Nếu đã tồn tại nhưng đã unsubscribe, kích hoạt lại
            if (!$existing->is_active) {
                $existing->update([
                    'is_active' => true,
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                ]);

                // Gửi email xác nhận
                try {
                    Mail::to($email)->send(new NewsletterSubscriptionConfirmation($email));
                } catch (\Exception $e) {
                    \Log::error('Failed to send newsletter confirmation email: ' . $e->getMessage());
                }

                // Tạo notification cho admin
                NotificationHelper::createAdminNotification(
                    'newsletter_subscribed',
                    'Đăng ký nhận tin giảm giá',
                    "Email {$email} đã đăng ký lại nhận tin giảm giá",
                    ['email' => $email]
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Đăng ký nhận tin thành công',
                ]);
            }

            // Nếu đã đăng ký rồi
            return response()->json([
                'success' => false,
                'message' => 'Email này đã đăng ký nhận tin rồi',
            ], 422);
        }

        // Tạo subscription mới
        $subscription = NewsletterSubscription::create([
            'email' => $email,
            'is_active' => true,
            'subscribed_at' => now(),
        ]);

        // Gửi email xác nhận
        try {
            Mail::to($email)->send(new NewsletterSubscriptionConfirmation($email));
        } catch (\Exception $e) {
            \Log::error('Failed to send newsletter confirmation email: ' . $e->getMessage());
        }

        // Tạo notification cho admin
        NotificationHelper::createAdminNotification(
            'newsletter_subscribed',
            'Đăng ký nhận tin giảm giá',
            "Email {$email} vừa đăng ký nhận tin giảm giá",
            ['email' => $email]
        );

        return response()->json([
            'success' => true,
            'message' => 'Đăng ký nhận tin thành công',
        ]);
    }
}
