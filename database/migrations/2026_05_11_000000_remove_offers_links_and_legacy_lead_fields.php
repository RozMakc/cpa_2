<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            foreach (['offer_id', 'offer_link_id', 'link_id'] as $column) {
                if (Schema::hasColumn('leads', $column)) {
                    $table->dropConstrainedForeignId($column);
                }
            }
        });

        $leadColumns = [
            'project_id' => fn(Blueprint $table) => $table->foreignId('project_id')->nullable()->after('user_id')->constrained()->nullOnDelete(),
            'tg_id' => fn(Blueprint $table) => $table->string('tg_id')->nullable()->after('phone'),
            'tg_username' => fn(Blueprint $table) => $table->string('tg_username')->nullable()->after('tg_id'),
            'message' => fn(Blueprint $table) => $table->text('message')->nullable()->after('is_our_channel'),
        ];

        foreach ($leadColumns as $column => $definition) {
            if (!Schema::hasColumn('leads', $column)) {
                Schema::table('leads', $definition);
            }
        }

        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'offer_id')) {
                $table->dropConstrainedForeignId('offer_id');
            }
        });

        Schema::dropIfExists('traffic');
        Schema::dropIfExists('integration_offer');
        Schema::dropIfExists('links');
        Schema::dropIfExists('offer_prices');
        Schema::dropIfExists('offer_links');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('offer_categories');
    }

    public function down(): void
    {
        //
    }
};
