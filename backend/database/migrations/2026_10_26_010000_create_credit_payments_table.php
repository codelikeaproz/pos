<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credit_payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number')->unique();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->decimal('amount', 12, 2);
            $table->dateTime('paid_at');
            $table->string('description', 500)->nullable();
            $table->foreignId('recorded_by_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->index(['order_id', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_payments');
    }
};
