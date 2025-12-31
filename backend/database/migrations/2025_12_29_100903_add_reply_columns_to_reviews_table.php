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
        Schema::table('reviews', function (Blueprint $table) {
            // Thêm cột reply nếu chưa tồn tại
            if (!Schema::hasColumn('reviews', 'reply')) {
                $table->text('reply')->nullable()->after('comment');
            }
            // Thêm cột replied_at nếu chưa tồn tại
            if (!Schema::hasColumn('reviews', 'replied_at')) {
                $table->timestamp('replied_at')->nullable()->after('reply');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Xóa cột nếu tồn tại
            if (Schema::hasColumn('reviews', 'replied_at')) {
                $table->dropColumn('replied_at');
            }
            if (Schema::hasColumn('reviews', 'reply')) {
                $table->dropColumn('reply');
            }
        });
    }
};
