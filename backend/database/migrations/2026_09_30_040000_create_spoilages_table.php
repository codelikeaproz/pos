<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spoilages', function (Blueprint $table) {
            $table->id();
            $table->string('spoilage_number', 32)->unique();
            $table->foreignId('station_id')->constrained()->restrictOnDelete();
            $table->foreignId('recorded_by_id')->constrained('users')->restrictOnDelete();
            $table->string('reason', 500)->nullable();
            $table->timestamp('spoiled_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spoilages');
    }
};
