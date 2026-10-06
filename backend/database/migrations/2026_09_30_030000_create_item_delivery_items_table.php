<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_delivery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_delivery_id')->constrained()->restrictOnDelete();
            $table->foreignId('item_id')->constrained()->restrictOnDelete();
            $table->string('item_code');
            $table->string('item_name');
            $table->string('unit');
            $table->decimal('quantity', 12, 2);
            $table->timestamps();
            $table->unique(['item_delivery_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_delivery_items');
    }
};
