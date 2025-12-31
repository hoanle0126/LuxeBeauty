<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Brand extends Model
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

        static::creating(function ($brand) {
            if (empty($brand->slug)) {
                $brand->slug = Str::slug($brand->name);
            }
        });

        static::updating(function ($brand) {
            // Tự động cập nhật slug khi name thay đổi
            if ($brand->isDirty('name')) {
                $brand->slug = Str::slug($brand->name);
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
     * Scope để lấy brands active
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

