<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Tính toán isVip (ví dụ: tổng chi tiêu > 10,000,000 VND)
        $isVip = ($this->totalSpent ?? 0) >= 10000000;

        // Lấy status từ user (nếu có field status) hoặc mặc định là active
        $status = $this->status ?? 'active';

        // Lấy đơn hàng gần nhất
        $lastOrder = $this->orders()->latest()->first();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar ?? null,
            'address' => $this->address ?? null,
            'totalOrders' => $this->totalOrders ?? 0,
            'totalSpent' => (int) ($this->totalSpent ?? 0),
            'joinedDate' => $this->created_at?->toDateString(),
            'status' => $status,
            'isVip' => $isVip,
            'lastOrderDate' => $lastOrder?->created_at?->toDateString(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}

