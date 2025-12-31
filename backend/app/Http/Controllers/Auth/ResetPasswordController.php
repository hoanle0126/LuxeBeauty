<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class ResetPasswordController extends Controller
{
    /**
     * Gửi email reset password
     *
     * @param ForgotPasswordRequest $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated()['email'];

        // Gửi email reset password link
        $status = Password::sendResetLink(
            ['email' => $email]
        );

        // Log để tracking (optional, có thể bỏ nếu không cần)
        \Log::info('Password reset requested', [
            'email' => $email,
            'status' => $status,
            'ip' => $request->ip(),
        ]);

        // Luôn trả về success để không leak thông tin email có tồn tại hay không
        // (bảo mật tốt hơn)
        // Laravel sẽ tự động gửi email nếu email tồn tại trong hệ thống
        return response()->json([
            'success' => true,
            'message' => 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link reset password đến email của bạn.',
        ], 200);
    }

    /**
     * Reset password với token
     *
     * @param ResetPasswordRequest $request
     * @return JsonResponse
     * @throws ValidationException
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        // Map confirm_password thành password_confirmation (Laravel yêu cầu)
        $credentials = $request->validated();
        $credentials['password_confirmation'] = $credentials['confirm_password'];
        unset($credentials['confirm_password']);

        $status = Password::reset(
            $credentials,
            function ($user, $password) {
                $user->password = $password;
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
            ], 200);
        }

        // Xử lý các trường hợp lỗi
        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
