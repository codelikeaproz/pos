<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consignees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('consignee_id')->references('id')->on('consignees')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['consignee_id']);
        });

        Schema::dropIfExists('consignees');
    }
};
