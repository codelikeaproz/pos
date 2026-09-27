<?php

namespace Tests\Feature;

use App\Models\Consignee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConsigneeManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorization(): void
    {
        $this->getJson('/api/consignees')->assertUnauthorized();
        Sanctum::actingAs(User::factory()->endUser()->create());
        $this->getJson('/api/consignees')->assertForbidden();
        $this->postJson('/api/consignees', [])->assertForbidden();
    }

    public function test_admin_can_create_show_and_delete_a_consignee(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $response = $this->postJson('/api/consignees', ['name' => 'Juan Dela Cruz', 'contact_number' => '+63 917 123-4567', 'email' => 'juan@example.com', 'address' => 'Bukidnon'])
            ->assertCreated()->assertJsonPath('message', 'Consignee added successfully.')->assertJsonPath('consignee.contact_number', '+63 917 123-4567');
        $id = $response->json('consignee.id');
        $this->getJson("/api/consignees/{$id}")->assertOk()->assertJsonPath('consignee.email', 'juan@example.com');
        $this->deleteJson("/api/consignees/{$id}")->assertOk()->assertJsonPath('message', 'Consignee deleted successfully.');
        $this->assertDatabaseMissing('consignees', ['id' => $id]);
    }

    public function test_validation_and_optional_fields(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->postJson('/api/consignees', [])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->postJson('/api/consignees', ['name' => 'Invalid', 'email' => 'not-email'])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->postJson('/api/consignees', ['name' => 'Optional Fields', 'contact_number' => ' ', 'email' => '', 'address' => '  '])
            ->assertCreated()->assertJsonPath('consignee.contact_number', null)->assertJsonPath('consignee.email', null)->assertJsonPath('consignee.address', null);
    }

    public function test_admin_can_update_with_put_and_patch(): void
    {
        $consignee = Consignee::query()->create(['name' => 'Original']);
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->putJson("/api/consignees/{$consignee->id}", ['name' => 'Updated', 'contact_number' => '09171234567'])->assertOk()->assertJsonPath('consignee.name', 'Updated');
        $this->patchJson("/api/consignees/{$consignee->id}", ['name' => 'Patched', 'email' => 'patched@example.com'])->assertOk()->assertJsonPath('consignee.email', 'patched@example.com');
    }

    public function test_searches_supported_fields_and_returns_zero_results(): void
    {
        Consignee::query()->create(['name' => 'Juan Dela Cruz', 'contact_number' => '09171234567', 'email' => 'juan@example.com']);
        Sanctum::actingAs(User::factory()->admin()->create());
        foreach (['Juan', '0917', 'juan@example.com'] as $term) {
            $this->getJson('/api/consignees?search='.urlencode($term))->assertOk()->assertJsonCount(1, 'data');
        }
        $this->getJson('/api/consignees?search=missing')->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
    }

    public function test_empty_search_is_sorted_and_paginates_ten_records(): void
    {
        foreach (range(1, 11) as $number) {
            Consignee::query()->create(['name' => sprintf('Consignee %02d', $number)]);
        }
        Sanctum::actingAs(User::factory()->admin()->create());
        $this->getJson('/api/consignees?search=&page=1')->assertOk()->assertJsonCount(10, 'data')
            ->assertJsonPath('data.0.name', 'Consignee 01')->assertJsonPath('meta.per_page', 10)->assertJsonPath('meta.total', 11)->assertJsonPath('meta.last_page', 2);
    }
}
