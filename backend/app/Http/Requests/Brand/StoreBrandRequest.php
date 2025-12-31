<?php

namespace App\Http\Requests\Brand;

use Illuminate\Foundation\Http\FormRequest;

class StoreBrandRequest extends FormRequest
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
        return [
            'name' => 'required|string|max:255|unique:brands,name',
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string|max:500',
            'status' => 'nullable|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên thương hiệu',
            'name.max' => 'Tên thương hiệu không được vượt quá 255 ký tự',
            'name.unique' => 'Tên thương hiệu đã tồn tại',
            'description.max' => 'Mô tả không được vượt quá 500 ký tự',
            'thumbnail.max' => 'Đường dẫn thumbnail không được vượt quá 500 ký tự',
            'status.in' => 'Trạng thái phải là active hoặc inactive',
        ];
    }
}

