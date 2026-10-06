<?php

namespace Tests\Feature;

use App\Models\InventoryMovement;
use App\Models\Item;
use App\Models\StationItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ItemManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_item_management_requires_authentication(): void
    {
        $this->getJson('/api/items')->assertUnauthorized();
    }

    public function test_end_user_cannot_access_item_management(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/items')->assertForbidden();
        $this->postJson('/api/items', [])->assertForbidden();
    }

    public function test_admin_can_create_show_and_deactivate_an_item_with_price_history(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/items', [
            'item_code' => 'FD-001',
            'name' => 'Cheeseburger',
            'units_backup' => 'SERVING',
            'unit' => '7',
            'reorder_point' => '3.000',
            'price' => '85.00',
        ])->assertCreated()
            ->assertJsonPath('message', 'Item added successfully.')
            ->assertJsonPath('item.item_code', 'FD-001')
            ->assertJsonPath('item.name', 'Cheeseburger')
            ->assertJsonPath('item.units_backup', 'SERVING')
            ->assertJsonPath('item.unit', '7')
            ->assertJsonPath('item.reorder_point', '3.000')
            ->assertJsonMissingPath('item.quantity')
            ->assertJsonPath('item.is_active', true)
            ->assertJsonPath('item.price', '85.00');

        $itemId = $response->json('item.id');
        $this->getJson("/api/items/{$itemId}")
            ->assertOk()->assertJsonPath('item.name', 'Cheeseburger');
        $this->deleteJson("/api/items/{$itemId}")->assertConflict();
        $this->putJson("/api/items/{$itemId}", [
            'item_code' => 'FD-001', 'name' => 'Cheeseburger',
            'units_backup' => 'SERVING', 'unit' => '7', 'reorder_point' => '3.000',
            'is_active' => false,
        ])->assertOk()->assertJsonPath('item.is_active', false);
        $this->assertDatabaseHas('prices', ['item_id' => $itemId, 'amount' => '85.00', 'is_active' => true]);
    }

    public function test_name_is_required(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/items', $this->validItem(['item_code' => 'DRINK-001', 'name' => 'Water', 'price' => 20]))
            ->assertCreated()->assertJsonPath('item.name', 'Water')->assertJsonPath('item.price', '20.00');
        $this->postJson('/api/items', $this->validItem(['item_code' => 'DRINK-002', 'name' => '']))
            ->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_required_item_fields_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/items', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['item_code', 'name', 'units_backup', 'unit', 'reorder_point', 'price']);
    }

    public function test_price_validation_accepts_two_decimals_and_rejects_invalid_values(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['85', '85.00', '85.5', '0'] as $index => $price) {
            $this->postJson('/api/items', $this->validItem(['item_code' => "PRICE-{$index}", 'name' => "Valid {$price}", 'price' => $price]))->assertCreated();
        }

        foreach (['-1', '12.345', 'price', '999999999.99'] as $price) {
            $this->postJson('/api/items', $this->validItem(['item_code' => 'INVALID-'.md5($price), 'name' => 'Invalid price', 'price' => $price]))
                ->assertUnprocessable()->assertJsonValidationErrors('price');
        }
    }

    public function test_item_code_and_unit_validation_and_rejects_product_quantity(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/items', $this->validItem(['quantity' => '999999']))
            ->assertUnprocessable()->assertJsonValidationErrors('quantity');
        $this->postJson('/api/items', $this->validItem(['unit' => '']))
            ->assertUnprocessable()->assertJsonValidationErrors('unit');
        $this->postJson('/api/items', $this->validItem(['units_backup' => '']))
            ->assertUnprocessable()->assertJsonValidationErrors('units_backup');
        $this->postJson('/api/items', $this->validItem(['reorder_point' => '-1']))
            ->assertUnprocessable()->assertJsonValidationErrors('reorder_point');

        $this->postJson('/api/items', $this->validItem(['item_code' => 'CUSTOM-UNIT', 'units_backup' => 'TRAY', 'unit' => '18']))
            ->assertCreated()->assertJsonPath('item.units_backup', 'TRAY')->assertJsonPath('item.unit', '18');

        $this->postJson('/api/items', $this->validItem())->assertCreated();
        $this->postJson('/api/items', $this->validItem(['name' => 'Duplicate code']))
            ->assertUnprocessable()->assertJsonValidationErrors('item_code');
    }

    public function test_admin_can_update_with_put_and_patch(): void
    {
        $item = Item::query()->create($this->validItem(['item_code' => 'EDIT-001', 'name' => 'Original', 'price' => '10.00']));
        $item->prices()->create(['amount' => '10.00', 'is_active' => true]);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/items/{$item->id}", $this->validUpdate(['item_code' => 'EDIT-001', 'name' => 'Updated', 'units_backup' => 'KILOGRAM', 'unit' => '9', 'reorder_point' => '2.000']))
            ->assertOk()->assertJsonPath('item.price', '10.00');
        $this->patchJson("/api/items/{$item->id}", $this->validUpdate(['item_code' => 'EDIT-001', 'name' => 'Patched', 'units_backup' => 'BOX', 'unit' => '3']))
            ->assertOk()->assertJsonPath('item.name', 'Patched')->assertJsonPath('item.price', '10.00');
        $this->putJson("/api/items/{$item->id}", $this->validItem(['item_code' => 'EDIT-001', 'price' => '12.50']))
            ->assertUnprocessable()->assertJsonValidationErrors('price');
    }

    public function test_item_names_are_not_forced_to_be_unique(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $payload = $this->validItem(['item_code' => 'WATER-001', 'name' => 'Bottled Water', 'price' => '20.00']);
        $this->postJson('/api/items', $payload)->assertCreated();
        $this->postJson('/api/items', [...$payload, 'item_code' => 'WATER-002'])->assertCreated();
    }

    public function test_creating_and_updating_product_does_not_create_or_change_stock(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $response = $this->postJson('/api/items', $this->validItem())->assertCreated();
        $itemId = $response->json('item.id');
        $this->assertDatabaseCount('station_items', 0);
        $this->assertDatabaseCount('inventory_movements', 0);

        $this->putJson("/api/items/{$itemId}", $this->validUpdate(['name' => 'Updated Product']))->assertOk();
        $this->assertSame(0, StationItem::query()->where('item_id', $itemId)->count());
        $this->assertSame(0, InventoryMovement::query()->where('item_id', $itemId)->count());
    }

    public function test_searches_item_code_name_and_unit_name_and_returns_zero_results(): void
    {
        Item::query()->create($this->validItem(['item_code' => 'FD-SEARCH', 'name' => 'Cheeseburger', 'units_backup' => 'SERVING', 'price' => '85.00']));
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['FD-SEARCH', 'Cheese', 'SERVING'] as $searchTerm) {
            $this->getJson('/api/items?search='.urlencode($searchTerm))->assertOk()->assertJsonCount(1, 'data');
        }
        $this->getJson('/api/items?search=missing')->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
    }

    public function test_empty_search_is_sorted_and_paginates_ten_records(): void
    {
        foreach (range(1, 11) as $number) {
            Item::query()->create($this->validItem(['item_code' => sprintf('ITM-%03d', $number), 'name' => sprintf('Item %02d', $number), 'price' => '10.00']));
        }
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/items?search=&page=1')->assertOk()
            ->assertJsonCount(10, 'data')->assertJsonPath('data.0.name', 'Item 01')
            ->assertJsonPath('meta.per_page', 10)->assertJsonPath('meta.total', 11)->assertJsonPath('meta.last_page', 2);
        $this->getJson('/api/items?per_page=20')->assertOk()
            ->assertJsonCount(11, 'data')->assertJsonPath('meta.per_page', 20)->assertJsonPath('meta.last_page', 1);
        $this->getJson('/api/items?per_page=500')->assertUnprocessable()->assertJsonValidationErrors('per_page');
    }

    /** @param array<string, mixed> $overrides */
    private function validItem(array $overrides = []): array
    {
        return array_merge([
            'item_code' => 'ITM-001',
            'name' => 'Test Item',
            'units_backup' => 'PIECE',
            'unit' => '1',
            'reorder_point' => '2.000',
            'price' => '20.00',
        ], $overrides);
    }

    private function validUpdate(array $overrides = []): array
    {
        $payload = $this->validItem($overrides);
        unset($payload['price']);

        return $payload;
    }
}
