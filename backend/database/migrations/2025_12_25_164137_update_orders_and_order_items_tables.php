<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update orders table
        if (Schema::hasTable('orders')) {
            Schema::table('orders', function (Blueprint $table) {
                if (!Schema::hasColumn('orders', 'user_id')) {
                    $table->foreignId('user_id')->after('id')->constrained('users')->onDelete('cascade');
                }
                if (!Schema::hasColumn('orders', 'order_number')) {
                    $table->string('order_number')->unique()->after('user_id');
                }
                if (!Schema::hasColumn('orders', 'status')) {
                    $table->enum('status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending')->after('order_number');
                }
                if (!Schema::hasColumn('orders', 'subtotal')) {
                    $table->decimal('subtotal', 10, 2)->after('status');
                }
                if (!Schema::hasColumn('orders', 'shipping_fee')) {
                    $table->decimal('shipping_fee', 10, 2)->default(0)->after('subtotal');
                }
                if (!Schema::hasColumn('orders', 'total')) {
                    $table->decimal('total', 10, 2)->after('shipping_fee');
                }
                if (!Schema::hasColumn('orders', 'payment_method')) {
                    $table->string('payment_method')->nullable()->after('total');
                }
                if (!Schema::hasColumn('orders', 'payment_status')) {
                    $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->after('payment_method');
                }
                if (!Schema::hasColumn('orders', 'shipping_name')) {
                    $table->string('shipping_name')->after('payment_status');
                }
                if (!Schema::hasColumn('orders', 'shipping_phone')) {
                    $table->string('shipping_phone')->after('shipping_name');
                }
                if (!Schema::hasColumn('orders', 'shipping_address')) {
                    $table->string('shipping_address')->after('shipping_phone');
                }
                if (!Schema::hasColumn('orders', 'notes')) {
                    $table->text('notes')->nullable()->after('shipping_address');
                }
            });
        }

        // Update order_items table
        if (Schema::hasTable('order_items')) {
            Schema::table('order_items', function (Blueprint $table) {
                if (!Schema::hasColumn('order_items', 'order_id')) {
                    $table->foreignId('order_id')->after('id')->constrained('orders')->onDelete('cascade');
                }
                if (!Schema::hasColumn('order_items', 'product_id')) {
                    $table->foreignId('product_id')->after('order_id')->constrained('products')->onDelete('cascade');
                }
                if (!Schema::hasColumn('order_items', 'product_name')) {
                    $table->string('product_name')->after('product_id');
                }
                if (!Schema::hasColumn('order_items', 'product_price')) {
                    $table->decimal('product_price', 10, 2)->after('product_name');
                }
                if (!Schema::hasColumn('order_items', 'product_image')) {
                    $table->string('product_image')->nullable()->after('product_price');
                }
                if (!Schema::hasColumn('order_items', 'quantity')) {
                    $table->integer('quantity')->after('product_image');
                }
                if (!Schema::hasColumn('order_items', 'subtotal')) {
                    $table->decimal('subtotal', 10, 2)->after('quantity');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback changes if needed
    }
};
