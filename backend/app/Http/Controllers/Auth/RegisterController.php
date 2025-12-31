<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Helpers\NotificationHelper;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RegisterController extends Controller
{
    /**
     * Xử lý đăng ký user mới
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Tạo user mới
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        // Gán role mặc định cho user mới (buyer hoặc user)
        // Role sẽ được tạo trong seeder, nếu chưa có thì bỏ qua
        $defaultRole = Role::where('name', 'buyer')->first() 
            ?? Role::where('name', 'user')->first();
        
        if ($defaultRole) {
            $user->assignRole($defaultRole);
        }

        // Tự động login user sau khi đăng ký
        Auth::login($user);

        // Tạo token với Sanctum
        $token = $user->createToken('auth-token')->plainTextToken;

        // Tạo notification cho admin
        try {
            NotificationHelper::createAdminNotification(
                'user_registered',
                'Người dùng mới đăng ký',
                "Người dùng {$user->name} ({$user->email}) vừa đăng ký tài khoản mới",
                [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                ]
            );
        } catch (\Exception $e) {
            // Log lỗi nhưng không làm fail request
            \Log::error('Failed to create notification for new user: ' . $e->getMessage());
        }

        // Trả về response JSON chuẩn
        return response()->json([
            'success' => true,
            'message' => 'Đăng ký thành công',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }
}
