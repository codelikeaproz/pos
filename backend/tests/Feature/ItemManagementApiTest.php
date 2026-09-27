<?php

namespace Tests\Feature;

use App\Models\Item;
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

    public function test_admin_can_create_show_and_delete_an_item(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/items', [
            'item_code' => 'FD-001',
            'name' => 'Cheeseburger',
            'description' => 'Burger with cheese and vegetables.',
            'quantity' => '12.500',
            'unit' => 'serving',
            'price' => '85.00',
        ])->assertCreated()
            ->assertJsonPath('message', 'Item added successfully.')
            ->assertJsonPath('item.item_code', 'FD-001')
            ->assertJsonPath('item.quantity', '12.500')
            ->assertJsonPath('item.price', '85.00');

        $itemId = $response->json('item.id');
        $this->getJson("/api/items/{$itemId}")
            ->assertOk()->assertJsonPath('item.description', 'Burger with cheese and vegetables.');
        $this->deleteJson("/api/items/{$itemId}")
            ->assertOk()->assertJsonPath('message', 'Item deleted successfully.');
        $this->assertDatabaseMissing('items', ['id' => $itemId]);
    }

    public function test_description_is_optional_and_blank_is_normalized_to_null(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/items', $this->validItem(['item_code' => 'DRINK-001', 'name' => 'Water', 'price' => 20]))
            ->assertCreated()->assertJsonPath('item.description', null)->assertJsonPath('item.price', '20.00');
        $this->postJson('/api/items', $this->validItem(['item_code' => 'DRINK-002', 'name' => 'Juice', 'description' => '   ', 'price' => '25.5']))
            ->assertCreated()->assertJsonPath('item.description', null)->assertJsonPath('item.price', '25.50');
    }

    public function test_required_item_fields_are_validated(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/items', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['item_code', 'name', 'quantity', 'unit', 'price']);
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

    public function test_item_code_quantity_and_unit_validation(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/items', $this->validItem(['quantity' => '-1']))
            ->assertUnprocessable()->assertJsonValidationErrors('quantity');
        $this->postJson('/api/items', $this->validItem(['quantity' => '1.2345']))
            ->assertUnprocessable()->assertJsonValidationErrors('quantity');
        $this->postJson('/api/items', $this->validItem(['unit' => '']))
            ->assertUnprocessable()->assertJsonValidationErrors('unit');

        $this->postJson('/api/items', $this->validItem(['item_code' => 'CUSTOM-UNIT', 'unit' => 'tray']))
            ->assertCreated()->assertJsonPath('item.unit', 'tray');

        $this->postJson('/api/items', $this->validItem())->assertCreated();
        $this->postJson('/api/items', $this->validItem(['name' => 'Duplicate code']))
            ->assertUnprocessable()->assertJsonValidationErrors('item_code');
    }

    public function test_admin_can_update_with_put_and_patch(): void
    {
        $item = Item::query()->create($this->validItem(['item_code' => 'EDIT-001', 'name' => 'Original', 'price' => '10.00']));
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/items/{$item->id}", $this->validItem(['item_code' => 'EDIT-001', 'name' => 'Updated', 'quantity' => '5.250', 'unit' => 'kg', 'price' => '12.50']))
            ->assertOk()->assertJsonPath('item.price', '12.50');
        $this->patchJson("/api/items/{$item->id}", $this->validItem(['item_code' => 'EDIT-001', 'name' => 'Patched', 'quantity' => '6', 'unit' => 'box', 'price' => '15']))
            ->assertOk()->assertJsonPath('item.name', 'Patched')->assertJsonPath('item.price', '15.00');
    }

    public function test_item_names_are_not_forced_to_be_unique(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $payload = $this->validItem(['item_code' => 'WATER-001', 'name' => 'Bottled Water', 'price' => '20.00']);
        $this->postJson('/api/items', $payload)->assertCreated();
        $this->postJson('/api/items', [...$payload, 'item_code' => 'WATER-002'])->assertCreated();
    }

    public function test_searches_item_code_name_and_description_and_returns_zero_results(): void
    {
        Item::query()->create($this->validItem(['item_code' => 'FD-SEARCH', 'name' => 'Cheeseburger', 'description' => 'Burger with vegetables', 'price' => '85.00']));
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['FD-SEARCH', 'Cheese', 'vegetables'] as $searchTerm) {
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
    }

    /** @param array<string, mixed> $overrides */
    private function validItem(array $overrides = []): array
    {
        return array_merge([
            'item_code' => 'ITM-001',
            'name' => 'Test Item',
            'description' => null,
            'quantity' => '10.000',
            'unit' => 'pcs',
            'price' => '20.00',
        ], $overrides);
    }
}
