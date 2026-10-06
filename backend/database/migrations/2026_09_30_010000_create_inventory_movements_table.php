<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_item_id')->constrained()->restrictOnDelete();
            $table->foreignId('item_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->restrictOnDelete();
            $table->decimal('quantity_change', 12, 2);
            $table->string('type', 32);
            $table->string('reference_type', 32)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('actor_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
    }
};
