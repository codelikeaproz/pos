<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_end_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained()->restrictOnDelete();
            $table->foreignId('created_by_id')->constrained('users')->restrictOnDelete();
            $table->unsignedTinyInteger('report_month');
            $table->unsignedSmallInteger('report_year');
            $table->string('status', 16)->default('DRAFT');
            $table->foreignId('finalized_by_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->dateTime('finalized_at')->nullable();
            $table->timestamps();
            $table->unique(['station_id', 'report_month', 'report_year']);
        });

        Schema::create('monthly_end_report_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monthly_end_report_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained()->restrictOnDelete();
            $table->string('item_code_snapshot');
            $table->string('item_name_snapshot');
            $table->string('unit_snapshot', 50);
            $table->decimal('system_count', 12, 2);
            $table->decimal('physical_count', 12, 2)->nullable();
            $table->dateTime('reconciled_at')->nullable();
            $table->foreignId('reconciled_by_id')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('reconciliation_movement_id')->nullable()->constrained('inventory_movements')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['monthly_end_report_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_end_report_items');
        Schema::dropIfExists('monthly_end_reports');
    }
};
