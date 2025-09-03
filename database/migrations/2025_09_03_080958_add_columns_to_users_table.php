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
        Schema::table('users', function (Blueprint $table) {
            $table->double('balance')->after('phone')->default(0);
            $table->string('fullname')->after('apikey')->nullable();
            $table->dateTime('birthdate')->after('fullname')->nullable();
            $table->boolean('is_active')->after('birthdate')->default(0);
            $table->boolean('is_stopped')->after('is_active')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('birthdate');
            $table->dropColumn('fullname');
            $table->dropColumn('is_active');
            $table->dropColumn('balance');
            $table->dropColumn('is_stopped');
        });
    }
};
