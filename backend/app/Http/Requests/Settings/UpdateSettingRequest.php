<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Check admin role sẽ được thực hiện trong controller
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'value' => 'required',
            'group' => 'sometimes|string|in:general,notifications,shipping,appearance',
            'type' => 'sometimes|string|in:string,number,boolean,json',
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
            'value.required' => 'Giá trị setting không được để trống',
            'group.in' => 'Group không hợp lệ',
            'type.in' => 'Type không hợp lệ',
        ];
    }
}
