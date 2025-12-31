<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PromotionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'type' => $this->type,
            'value' => (float) $this->value,
            'minOrderAmount' => $this->min_order_amount ? (float) $this->min_order_amount : null,
            'maxDiscountAmount' => $this->max_discount_amount ? (float) $this->max_discount_amount : null,
            'usageLimit' => $this->usage_limit,
            'usedCount' => $this->used_count,
            'startDate' => $this->start_date?->toIso8601String(),
            'endDate' => $this->end_date?->toIso8601String(),
            'status' => $this->status,
            'isUsable' => $this->isUsable(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
