<?php

namespace App\Helpers;

use App\Models\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NotificationHelper
{
    /**
     * Tạo notification và gửi socket cho admin
     *
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array|null $data
     * @return Notification
     */
    public static function createAdminNotification(
        string $type,
        string $title,
        string $message,
        ?array $data = null
    ): Notification {
        // Tạo notification trong database
        $notification = Notification::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        // Gửi socket notification cho admin
        self::emitSocketNotification($notification);

        return $notification;
    }

    /**
     * Emit socket notification cho admin
     *
     * @param Notification $notification
     * @return void
     */
    private static function emitSocketNotification(Notification $notification): void
    {
        try {
            $socketUrl = config('app.socket_url', env('SOCKET_URL', 'http://localhost:3001'));
            
            // Gửi HTTP request đến socket server để emit notification
            Http::timeout(2)->post("{$socketUrl}/api/notify", [
                'room' => 'admin',
                'event' => 'admin:notification',
                'data' => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'created_at' => $notification->created_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            // Log lỗi nhưng không làm fail request
            Log::error('Failed to emit socket notification: ' . $e->getMessage());
        }
    }
}

