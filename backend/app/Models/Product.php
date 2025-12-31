<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'slug',
        'category_id',
        'brand_id',
        'price',
        'original_price',
        'images',
        'description',
        'ingredients',
        'stock',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'stock' => 'integer',
        'status' => 'string',
        'images' => 'array', // Cast JSON to array
    ];

    /**
     * Boot method để auto-generate slug từ name
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });

        static::updating(function ($product) {
            // Tự động cập nhật slug khi name thay đổi
            if ($product->isDirty('name')) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * Relationship với category
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relationship với brand
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Relationship với reviews
     */
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }


    /**
     * Scope để lấy products available
     */
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
}

