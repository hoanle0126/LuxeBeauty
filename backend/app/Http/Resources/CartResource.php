<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
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
            'productId' => $this->product_id,
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'image' => $this->product->images && count($this->product->images) > 0 ? $this->product->images[0] : null,
                'images' => $this->product->images ?? [],
                'price' => (float) $this->product->price,
                'originalPrice' => $this->product->original_price ? (float) $this->product->original_price : null,
            ],
            'quantity' => $this->quantity,
            'subtotal' => (float) ($this->product->price * $this->quantity),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
