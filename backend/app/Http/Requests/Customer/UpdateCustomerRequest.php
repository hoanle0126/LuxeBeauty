<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Có thể thêm middleware auth sau
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Lấy customer ID từ route parameter (có thể là int hoặc User model)
        $customerId = $this->route('id') ?? $this->route('customer');
        if ($customerId instanceof \App\Models\User) {
            $customerId = $customerId->id;
        }
        
        return [
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($customerId),
            ],
            'phone' => 'sometimes|nullable|string|max:20',
            'password' => 'sometimes|nullable|string|min:8',
            'address' => 'sometimes|nullable|string|max:500',
            'avatar' => 'sometimes|nullable|string|max:500',
            'status' => 'sometimes|in:active,blocked',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Tên khách hàng phải là chuỗi',
            'name.max' => 'Tên khách hàng không được vượt quá 255 ký tự',
            'email.email' => 'Email không hợp lệ',
            'email.unique' => 'Email đã tồn tại',
            'phone.string' => 'Số điện thoại phải là chuỗi',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự',
            'password.string' => 'Mật khẩu phải là chuỗi',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự',
            'address.string' => 'Địa chỉ phải là chuỗi',
            'address.max' => 'Địa chỉ không được vượt quá 500 ký tự',
            'avatar.string' => 'Đường dẫn avatar phải là chuỗi',
            'avatar.max' => 'Đường dẫn avatar không được vượt quá 500 ký tự',
            'status.in' => 'Trạng thái phải là active hoặc blocked',
        ];
    }
}

