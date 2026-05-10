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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->date('start_date')->nullable();
            $table->foreignId('client_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('offer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('integration_id')->nullable()->constrained()->nullOnDelete();
            $table->json('integrations')->nullable();
            $table->text('parsing_sources')->nullable();
            $table->json('inviting_sources')->nullable();
            $table->boolean('use_own_groups')->default(false);
            $table->text('mailing_groups')->nullable();
            $table->text('mailing_phones')->nullable();
            $table->text('mailing_usernames')->nullable();
            $table->text('mailing_text')->nullable();
            $table->string('image_path')->nullable();
            $table->string('external_id')->nullable();
            $table->string('sync_status')->default('queued');
            $table->text('sync_error')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->json('visible_fields')->nullable();
            $table->string('status')->default('active');
            $table->boolean('is_private')->default(false);
            $table->timestamps();
        });

        Schema::create('project_manager', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('leads', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });

        Schema::dropIfExists('project_manager');
        Schema::dropIfExists('projects');
    }
};
