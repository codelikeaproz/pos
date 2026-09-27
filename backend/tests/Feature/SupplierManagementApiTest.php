<?php

namespace Tests\Feature;

use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SupplierManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_supplier_management_requires_authentication(): void
    {
        $this->getJson('/api/suppliers')->assertUnauthorized();
    }

    public function test_end_user_cannot_access_supplier_management(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/suppliers')->assertForbidden();
        $this->postJson('/api/suppliers', [])->assertForbidden();
    }

    public function test_admin_can_create_show_and_delete_a_supplier(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $response = $this->postJson('/api/suppliers', [
            'name' => 'ABC Food Supplies',
            'contact_person' => 'Juan Dela Cruz',
            'contact_number' => '0917-123-4567',
            'email' => 'supplier@example.com',
            'address' => 'Bukidnon',
        ])->assertCreated()
            ->assertJsonPath('message', 'Supplier added successfully.')
            ->assertJsonPath('supplier.contact_number', '0917-123-4567');

        $supplierId = $response->json('supplier.id');
        $this->getJson("/api/suppliers/{$supplierId}")
            ->assertOk()
            ->assertJsonPath('supplier.email', 'supplier@example.com');
        $this->deleteJson("/api/suppliers/{$supplierId}")
            ->assertOk()
            ->assertJsonPath('message', 'Supplier deleted successfully.');
        $this->assertDatabaseMissing('suppliers', ['id' => $supplierId]);
    }

    public function test_optional_fields_may_be_omitted_or_blank(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/suppliers', ['name' => 'Simple Supplier'])
            ->assertCreated()
            ->assertJsonPath('supplier.contact_person', null);

        $this->postJson('/api/suppliers', [
            'name' => 'Blank Fields Supplier',
            'contact_person' => '   ',
            'contact_number' => '',
            'email' => ' ',
            'address' => '',
        ])->assertCreated()
            ->assertJsonPath('supplier.contact_person', null)
            ->assertJsonPath('supplier.email', null);
    }

    public function test_name_is_required_and_email_must_be_valid(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->postJson('/api/suppliers', [])->assertUnprocessable()
            ->assertJsonValidationErrors('name');
        $this->postJson('/api/suppliers', [
            'name' => 'Invalid Email Supplier',
            'email' => 'not-an-email',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_admin_can_update_with_put_and_patch(): void
    {
        $supplier = Supplier::query()->create(['name' => 'Original Supplier']);
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->putJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Updated Supplier',
            'contact_number' => '+63 917 123 4567',
        ])->assertOk()
            ->assertJsonPath('supplier.contact_number', '+63 917 123 4567');

        $this->patchJson("/api/suppliers/{$supplier->id}", [
            'name' => 'Patched Supplier',
            'email' => 'patched@example.com',
        ])->assertOk()
            ->assertJsonPath('supplier.name', 'Patched Supplier');
    }

    public function test_searches_supported_fields_and_returns_zero_results(): void
    {
        Supplier::query()->create([
            'name' => 'ABC Food Supplies',
            'contact_person' => 'Juan Dela Cruz',
            'contact_number' => '09171234567',
            'email' => 'abc@example.com',
        ]);
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['ABC', 'Juan', '0917', 'abc@example.com'] as $searchTerm) {
            $this->getJson('/api/suppliers?search='.urlencode($searchTerm))
                ->assertOk()->assertJsonCount(1, 'data');
        }

        $this->getJson('/api/suppliers?search=missing')
            ->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
    }

    public function test_empty_search_is_sorted_and_paginates_ten_records(): void
    {
        foreach (range(1, 11) as $number) {
            Supplier::query()->create(['name' => sprintf('Supplier %02d', $number)]);
        }
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/suppliers?search=&page=1')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('data.0.name', 'Supplier 01')
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 11)
            ->assertJsonPath('meta.last_page', 2);
    }
}
