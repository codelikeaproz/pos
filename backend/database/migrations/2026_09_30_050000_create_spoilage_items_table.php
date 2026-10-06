<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spoilage_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spoilage_id')->constrained()->restrictOnDelete();
            $table->foreignId('item_id')->constrained()->restrictOnDelete();
            $table->decimal('quantity', 12, 2);
            $table->string('item_code');
            $table->string('item_name');
            $table->string('unit');
            $table->timestamps();
            $table->unique(['spoilage_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spoilage_items');
    }
};
