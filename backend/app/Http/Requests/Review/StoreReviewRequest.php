<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // User phải đã authenticated
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
        ];
    }

    public function messages(): array
    {
        return [
            'rating.required' => 'Vui lòng chọn đánh giá',
            'rating.integer' => 'Đánh giá phải là số',
            'rating.min' => 'Đánh giá phải từ 1 sao',
            'rating.max' => 'Đánh giá không được quá 5 sao',
            'comment.required' => 'Vui lòng nhập nhận xét',
            'comment.string' => 'Nhận xét phải là chuỗi',
            'comment.max' => 'Nhận xét không được vượt quá 2000 ký tự',
        ];
    }
}
