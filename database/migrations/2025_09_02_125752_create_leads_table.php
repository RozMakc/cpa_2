<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 20)->unique();
            $table->foreignId('offer_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('link_id')->nullable();
            $table->foreignId('offer_link_id')->nullable()->constrained()->onDelete('set null');
            
            // Основная информация
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('comment')->nullable();
            
            // Статус и тип
            $table->enum('status', ['new', 'hold', 'completed', 'canceled'])->default('new');

            $table->decimal('price', 10, 2)->nullable();
            $table->string('currency', 3)->default('RUB');

            // UTM метки
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('utm_content')->nullable();
            
            // Sub параметры
            $table->string('sub1')->nullable();
            $table->string('sub2')->nullable();
            $table->string('sub3')->nullable();
            $table->string('sub4')->nullable();
            $table->string('sub5')->nullable();
            
            // Дополнительные данные
            $table->json('custom_fields')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('link_id')
                ->references('id')
                ->on('links')
                ->nullOnDelete();

            // Индексы
            $table->index('uuid');
            $table->index('status');
            $table->index('offer_id');
            $table->index('user_id');
            $table->index('link_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
