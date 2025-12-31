<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // User phải đã authenticated (middleware auth:sanctum sẽ check)
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'shipping_name' => 'required|string|min:2|max:50',
            'shipping_email' => 'required|email|max:255',
            'shipping_phone' => 'required|string|regex:/^(0|\+84)[0-9]{9,10}$/',
            'shipping_address' => 'required|string|min:10|max:500',
            'shipping_city' => 'required|string|min:2|max:100',
            'shipping_district' => 'required|string|min:2|max:100',
            'shipping_ward' => 'required|string|min:2|max:100',
            'payment_method' => 'required|string|in:cod,bank_transfer,bank,momo,card',
            'notes' => 'nullable|string|max:1000',
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
            'shipping_name.required' => 'Vui lòng nhập họ tên người nhận',
            'shipping_name.min' => 'Họ tên phải có ít nhất 2 ký tự',
            'shipping_name.max' => 'Họ tên không được vượt quá 50 ký tự',
            'shipping_email.required' => 'Vui lòng nhập email',
            'shipping_email.email' => 'Email không hợp lệ',
            'shipping_phone.required' => 'Vui lòng nhập số điện thoại',
            'shipping_phone.regex' => 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam (10-11 số)',
            'shipping_address.required' => 'Vui lòng nhập địa chỉ',
            'shipping_address.min' => 'Địa chỉ phải có ít nhất 10 ký tự',
            'shipping_address.max' => 'Địa chỉ không được vượt quá 500 ký tự',
            'shipping_city.required' => 'Vui lòng nhập thành phố',
            'shipping_city.min' => 'Tên thành phố phải có ít nhất 2 ký tự',
            'shipping_district.required' => 'Vui lòng nhập quận/huyện',
            'shipping_district.min' => 'Tên quận/huyện phải có ít nhất 2 ký tự',
            'shipping_ward.required' => 'Vui lòng nhập phường/xã',
            'shipping_ward.min' => 'Tên phường/xã phải có ít nhất 2 ký tự',
            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ',
            'notes.max' => 'Ghi chú không được vượt quá 1000 ký tự',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Map camelCase từ frontend sang snake_case cho backend
        $this->merge([
            'shipping_name' => $this->input('fullName') ?? $this->input('shipping_name'),
            'shipping_email' => $this->input('email') ?? $this->input('shipping_email'),
            'shipping_phone' => $this->input('phone') ?? $this->input('shipping_phone'),
            'shipping_address' => $this->input('address') ?? $this->input('shipping_address'),
            'shipping_city' => $this->input('city') ?? $this->input('shipping_city'),
            'shipping_district' => $this->input('district') ?? $this->input('shipping_district'),
            'shipping_ward' => $this->input('ward') ?? $this->input('shipping_ward'),
            'payment_method' => $this->input('paymentMethod') ?? $this->input('payment_method'),
            'notes' => $this->input('notes') ?? $this->input('notes'),
        ]);
    }
}
