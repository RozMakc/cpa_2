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
        Schema::table('projects', function (Blueprint $table) {
            $table->date('start_date')->nullable()->change();
            $table->dropForeign(['offer_id']);
            $table->foreignId('offer_id')->nullable()->change();
            $table->foreign('offer_id')->references('id')->on('offers')->nullOnDelete();
        });

        $columns = [
            'user_id' => fn(Blueprint $table) => $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete(),
            'integration_id' => fn(Blueprint $table) => $table->foreignId('integration_id')->nullable()->after('offer_id')->constrained()->nullOnDelete(),
            'integrations' => fn(Blueprint $table) => $table->json('integrations')->nullable()->after('integration_id'),
            'parsing_sources' => fn(Blueprint $table) => $table->text('parsing_sources')->nullable()->after('integrations'),
            'inviting_sources' => fn(Blueprint $table) => $table->json('inviting_sources')->nullable()->after('parsing_sources'),
            'use_own_groups' => fn(Blueprint $table) => $table->boolean('use_own_groups')->default(false)->after('inviting_sources'),
            'mailing_groups' => fn(Blueprint $table) => $table->text('mailing_groups')->nullable()->after('inviting_sources'),
            'mailing_phones' => fn(Blueprint $table) => $table->text('mailing_phones')->nullable()->after('mailing_groups'),
            'mailing_usernames' => fn(Blueprint $table) => $table->text('mailing_usernames')->nullable()->after('mailing_phones'),
            'mailing_text' => fn(Blueprint $table) => $table->text('mailing_text')->nullable()->after('mailing_usernames'),
            'image_path' => fn(Blueprint $table) => $table->string('image_path')->nullable()->after('mailing_text'),
            'external_id' => fn(Blueprint $table) => $table->string('external_id')->nullable()->after('image_path'),
            'sync_status' => fn(Blueprint $table) => $table->string('sync_status')->default('queued')->after('external_id'),
            'sync_error' => fn(Blueprint $table) => $table->text('sync_error')->nullable()->after('sync_status'),
            'synced_at' => fn(Blueprint $table) => $table->timestamp('synced_at')->nullable()->after('sync_error'),
        ];

        foreach ($columns as $column => $definition) {
            if (!Schema::hasColumn('projects', $column)) {
                Schema::table('projects', $definition);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'user_id')) {
                $table->dropForeign(['user_id']);
            }

            if (Schema::hasColumn('projects', 'integration_id')) {
                $table->dropForeign(['integration_id']);
            }

            $table->dropColumn(array_values(array_filter([
                Schema::hasColumn('projects', 'user_id') ? 'user_id' : null,
                Schema::hasColumn('projects', 'integration_id') ? 'integration_id' : null,
                Schema::hasColumn('projects', 'integrations') ? 'integrations' : null,
                Schema::hasColumn('projects', 'parsing_sources') ? 'parsing_sources' : null,
                Schema::hasColumn('projects', 'inviting_sources') ? 'inviting_sources' : null,
                Schema::hasColumn('projects', 'use_own_groups') ? 'use_own_groups' : null,
                Schema::hasColumn('projects', 'mailing_groups') ? 'mailing_groups' : null,
                Schema::hasColumn('projects', 'mailing_phones') ? 'mailing_phones' : null,
                Schema::hasColumn('projects', 'mailing_usernames') ? 'mailing_usernames' : null,
                Schema::hasColumn('projects', 'mailing_text') ? 'mailing_text' : null,
                Schema::hasColumn('projects', 'image_path') ? 'image_path' : null,
                Schema::hasColumn('projects', 'external_id') ? 'external_id' : null,
                Schema::hasColumn('projects', 'sync_status') ? 'sync_status' : null,
                Schema::hasColumn('projects', 'sync_error') ? 'sync_error' : null,
                Schema::hasColumn('projects', 'synced_at') ? 'synced_at' : null,
            ])));

            $table->dropForeign(['offer_id']);
            $table->date('start_date')->nullable(false)->change();
            $table->foreignId('offer_id')->nullable(false)->change();
            $table->foreign('offer_id')->references('id')->on('offers')->cascadeOnDelete();
        });
    }
};
