<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 20)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('integration_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->nullable();
            $table->string('firstname')->nullable();
            $table->string('lastname')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('tg_id')->nullable();
            $table->string('tg_username')->nullable();
            $table->string('tg_channel')->nullable();
            $table->boolean('is_our_channel')->default(false);
            $table->text('message')->nullable();
            $table->text('comment')->nullable();
            $table->string('status')->default('new');
            $table->boolean('is_counted')->default(true);
            $table->string('type')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 3)->default('RUB');
            $table->string('products')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_term')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('sub1')->nullable();
            $table->string('sub2')->nullable();
            $table->string('sub3')->nullable();
            $table->string('sub4')->nullable();
            $table->string('sub5')->nullable();
            $table->json('custom_fields')->nullable();
            $table->json('additional_data')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('uuid');
            $table->index('status');
            $table->index('user_id');
            $table->index('project_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
