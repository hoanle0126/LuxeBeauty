<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'description',
        'thumbnail',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Boot method để auto-generate slug từ name
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            // Tự động cập nhật slug khi name thay đổi
            if ($category->isDirty('name')) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    /**
     * Relationship với products
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope để lấy categories active
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

