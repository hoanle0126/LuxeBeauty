<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // User chỉ có thể update profile của chính mình
        return true; // Middleware auth:sanctum sẽ check authentication
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();

        return [
            'name' => 'required|string|min:2|max:50',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|regex:/^(0|\+84)[0-9]{9,10}$/',
            'address' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập họ tên',
            'name.min' => 'Họ tên phải có ít nhất 2 ký tự',
            'name.max' => 'Họ tên không được vượt quá 50 ký tự',
            'email.required' => 'Vui lòng nhập email',
            'email.email' => 'Email không hợp lệ',
            'email.unique' => 'Email này đã được sử dụng',
            'phone.regex' => 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số)',
            'address.max' => 'Địa chỉ không được vượt quá 500 ký tự',
            'avatar.max' => 'Đường dẫn avatar không được vượt quá 500 ký tự',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Map camelCase từ frontend sang snake_case cho backend
        $this->merge([
            'name' => $this->input('fullName') ?? $this->input('name'),
            'email' => $this->input('email'),
            'phone' => $this->input('phone') ?: null,
            'address' => $this->input('address') ?: null,
            'avatar' => $this->input('avatar') ?: null,
        ]);
    }
}
