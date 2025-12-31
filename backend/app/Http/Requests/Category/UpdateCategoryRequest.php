<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $categoryId = $category instanceof \App\Models\Category ? $category->id : $category;
        
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($categoryId),
            ],
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string|max:500',
            'status' => 'required|in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên danh mục',
            'name.max' => 'Tên danh mục không được vượt quá 255 ký tự',
            'name.unique' => 'Tên danh mục đã tồn tại',
            'description.max' => 'Mô tả không được vượt quá 500 ký tự',
            'thumbnail.max' => 'Đường dẫn thumbnail không được vượt quá 500 ký tự',
            'status.required' => 'Vui lòng chọn trạng thái',
            'status.in' => 'Trạng thái phải là active hoặc inactive',
        ];
    }
}

