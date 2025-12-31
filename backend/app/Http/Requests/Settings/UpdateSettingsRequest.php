<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
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
        $group = $this->input('group', 'general');

        $baseRules = [
            'settings' => 'required|array',
            'group' => 'sometimes|string|in:general,shipping,appearance,homepage',
        ];

        // Validation rules theo từng group
        $groupRules = match ($group) {
            'general' => [
                'settings.siteName' => 'required|string|min:1|max:255',
                'settings.siteDescription' => 'nullable|string|max:500',
                'settings.contactEmail' => 'required|email|max:255',
                'settings.contactPhone' => 'required|string|min:10|max:20',
                'settings.address' => 'required|string|min:1|max:500',
            ],
            'shipping' => [
                'settings.freeShippingThreshold' => 'required|numeric|min:0',
                'settings.shippingFee' => 'required|numeric|min:0',
                'settings.estimatedDeliveryDays' => ['required', 'string', 'regex:#^\d+\s*-\s*\d+(\s*(ngày|days))?$#i'],
            ],
            'appearance' => [
                'settings.favicon' => 'nullable|string|max:500',
                'settings.metaTitle' => 'nullable|string|max:60',
                'settings.metaDescription' => 'nullable|string|max:160',
                'settings.metaKeywords' => 'nullable|string|max:255',
                'settings.primaryColor' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            ],
            'homepage' => [
                'settings.heroNewCollection' => 'nullable|string|max:100',
                'settings.heroTitle' => 'nullable|string|max:100',
                'settings.heroTitleHighlight' => 'nullable|string|max:100',
                'settings.heroSubtitle' => 'nullable|string|max:500',
                'settings.heroBackgroundImage' => 'nullable|string|max:500',
            ],
            default => [],
        };

        return array_merge($baseRules, $groupRules);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'settings.required' => 'Settings không được để trống',
            'settings.array' => 'Settings phải là mảng',
            'group.in' => 'Group không hợp lệ',
            'settings.siteName.required' => 'Tên website không được để trống',
            'settings.siteName.min' => 'Tên website phải có ít nhất 1 ký tự',
            'settings.contactEmail.required' => 'Email liên hệ không được để trống',
            'settings.contactEmail.email' => 'Email không hợp lệ',
            'settings.contactPhone.required' => 'Số điện thoại không được để trống',
            'settings.contactPhone.min' => 'Số điện thoại phải có ít nhất 10 ký tự',
            'settings.address.required' => 'Địa chỉ không được để trống',
            'settings.freeShippingThreshold.required' => 'Ngưỡng miễn phí vận chuyển không được để trống',
            'settings.freeShippingThreshold.numeric' => 'Ngưỡng miễn phí vận chuyển phải là số',
            'settings.freeShippingThreshold.min' => 'Ngưỡng miễn phí vận chuyển phải lớn hơn hoặc bằng 0',
            'settings.shippingFee.required' => 'Phí vận chuyển không được để trống',
            'settings.shippingFee.numeric' => 'Phí vận chuyển phải là số',
            'settings.shippingFee.min' => 'Phí vận chuyển phải lớn hơn hoặc bằng 0',
            'settings.estimatedDeliveryDays.regex' => 'Thời gian giao hàng không hợp lệ (ví dụ: 3-5 ngày)',
            'settings.metaTitle.max' => 'Meta title không được vượt quá 60 ký tự',
            'settings.metaDescription.max' => 'Meta description không được vượt quá 160 ký tự',
            'settings.metaKeywords.max' => 'Meta keywords không được vượt quá 255 ký tự',
            'settings.primaryColor.regex' => 'Màu primary phải là mã màu hex hợp lệ (ví dụ: #FF5733)',
        ];
    }
}
