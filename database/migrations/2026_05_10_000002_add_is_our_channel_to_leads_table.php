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
        if (!Schema::hasColumn('leads', 'is_our_channel')) {
            Schema::table('leads', function (Blueprint $table) {
                $table->boolean('is_our_channel')->default(false)->after('tg_channel');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('leads', 'is_our_channel')) {
            Schema::table('leads', function (Blueprint $table) {
                $table->dropColumn('is_our_channel');
            });
        }
    }
};
