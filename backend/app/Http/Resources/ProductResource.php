<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category?->name,
            'categoryId' => $this->category_id,
            'categorySlug' => $this->category?->slug,
            'brand' => $this->brand?->name,
            'brandId' => $this->brand_id,
            'brandSlug' => $this->brand?->slug,
            'price' => (float) $this->price,
            'originalPrice' => $this->original_price ? (float) $this->original_price : null,
            'image' => $this->images && count($this->images) > 0 ? $this->images[0] : null, // Backward compatibility
            'images' => $this->images ?? [],
            'description' => $this->description,
            'ingredients' => $this->ingredients,
            'stock' => $this->stock,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}

