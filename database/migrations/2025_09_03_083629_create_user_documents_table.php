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
        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('pasport_birthplace')->nullable();
            $table->string('pasport_series')->nullable();
            $table->string('pasport_number')->nullable();
            $table->string('pasport_who')->nullable();
            $table->string('pasport_when')->nullable();
            $table->string('pasport_code')->nullable();
            $table->string('inn')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_documents');
    }
};
