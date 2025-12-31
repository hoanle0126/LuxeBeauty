<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            // Accept both camelCase and snake_case
            'categoryId' => 'nullable|exists:categories,id',
            'category_id' => 'nullable|exists:categories,id',
            'brandId' => 'nullable|exists:brands,id',
            'brand_id' => 'nullable|exists:brands,id',
            'price' => 'required|numeric|min:0',
            'originalPrice' => 'nullable|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'ingredients' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'status' => 'nullable|in:available,low_stock,out_of_stock,discontinued',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên sản phẩm',
            'name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự',
            'categoryId.exists' => 'Danh mục không tồn tại',
            'brandId.exists' => 'Thương hiệu không tồn tại',
            'price.required' => 'Vui lòng nhập giá sản phẩm',
            'price.numeric' => 'Giá sản phẩm phải là số',
            'price.min' => 'Giá sản phẩm phải lớn hơn hoặc bằng 0',
            'originalPrice.numeric' => 'Giá gốc phải là số',
            'originalPrice.min' => 'Giá gốc phải lớn hơn hoặc bằng 0',
            'images.array' => 'Hình ảnh phải là mảng',
            'images.*.string' => 'Mỗi hình ảnh phải là chuỗi',
            'images.*.max' => 'Đường dẫn hình ảnh không được vượt quá 500 ký tự',
            'stock.integer' => 'Số lượng tồn kho phải là số nguyên',
            'stock.min' => 'Số lượng tồn kho phải lớn hơn hoặc bằng 0',
            'status.in' => 'Trạng thái không hợp lệ',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Map camelCase to snake_case for database
        // Use input() to get the actual request value, not the merged value
        $categoryId = $this->input('categoryId');
        $brandId = $this->input('brandId');
        $originalPrice = $this->input('originalPrice');
        
        $this->merge([
            'category_id' => $categoryId !== null && $categoryId !== '' ? $categoryId : null,
            'brand_id' => $brandId !== null && $brandId !== '' ? $brandId : null,
            'original_price' => $originalPrice !== null && $originalPrice !== '' ? $originalPrice : null,
        ]);
    }
}

