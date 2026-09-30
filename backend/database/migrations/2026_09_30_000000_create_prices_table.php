<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Price history is introduced with a separate Item lifecycle flag.
        // Deactivating an Item hides it from new sales without deleting its Prices.
        if (! Schema::hasColumn('items', 'is_active')) {
            Schema::table('items', function (Blueprint $table) {
                $table->boolean('is_active')->default(true);
            });
        }

        if (! Schema::hasTable('prices')) {
            Schema::create('prices', function (Blueprint $table) {
                $table->id();
                $table->foreignId('item_id')->constrained()->restrictOnDelete();
                $table->decimal('amount', 12, 2);
                $table->boolean('is_active')->default(false);
                $table->timestamps();
                $table->index(['item_id', 'is_active']);
            });
        }

        $this->backfillPrices();
    }

    // Rerunnable after a partial deployment; never changes an existing Price.
    public function backfillPrices(): void
    {
        DB::transaction(function () {
            DB::table('items')->orderBy('id')->select(['id', 'price'])->chunkById(500, function ($items) {
                foreach ($items as $item) {
                    if (! DB::table('prices')->where('item_id', $item->id)->exists()) {
                        DB::table('prices')->insert([
                            'item_id' => $item->id,
                            'amount' => $item->price,
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            });
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prices');
        Schema::table('items', fn (Blueprint $table) => $table->dropColumn('is_active'));
    }
};
