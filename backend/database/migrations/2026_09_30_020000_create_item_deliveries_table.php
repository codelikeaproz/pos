<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('delivery_number', 32)->unique();
            $table->foreignId('station_id')->constrained()->restrictOnDelete();
            $table->foreignId('delivered_by_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('received_by_id')->constrained('users')->restrictOnDelete();
            $table->timestamp('delivered_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_deliveries');
    }
};
