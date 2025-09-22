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
        Schema::table('integrations', function (Blueprint $table) {
            $table->json('field_mappings')->nullable(); // Сопоставление полей
            $table->json('api_fields')->nullable(); // Поля API (ручное добавление)
            $table->json('settings')->nullable(); // Дополнительные настройки
            $table->boolean('is_active')->default(true);
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->foreignId('integration_id')->nullable()->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->dropColumn('field_mappings');
            $table->dropColumn('api_fields');
            $table->dropColumn('settings');
            $table->dropColumn('is_active');
        });
        Schema::table('offers', function (Blueprint $table) {
            $table->dropForeign(['integration_id']);
            $table->dropColumn('integration_id');
        });
        Schema::dropIfExists('integration_offer');
    }
};
