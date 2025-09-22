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
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->foreignId('integration_id')->nullable()->constrained()->nullOnDelete();
            $table->json('additional_data')->nullable();
            $table->boolean('is_counted')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('name');
            $table->dropForeign(['integration_id']);
            $table->dropColumn('integration_id');
            $table->dropColumn('additional_data');
        });
    }
};
