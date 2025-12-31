<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
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
            'user' => $this->user->name,
            'userId' => $this->user_id,
            'avatar' => $this->user->avatar ?? null,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'reply' => $this->reply,
            'replyDate' => $this->replied_at?->toIso8601String(),
            'date' => $this->created_at?->diffForHumans(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
