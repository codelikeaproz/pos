<?php

namespace Tests\Feature;

use App\Models\TaxSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TaxSettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_configuration_is_non_vat_and_admin_can_read_it(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        $this->getJson('/api/tax-settings')->assertOk()
            ->assertJsonPath('taxSetting.taxStatus', 'NON_VAT')
            ->assertJsonPath('taxSetting.vatRate', '12.00')
            ->assertJsonPath('taxSetting.vatCalculationActive', false);
    }

    public function test_admin_can_update_reference_rate_and_actor_is_recorded(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $this->putJson('/api/tax-settings', ['taxStatus' => 'NON_VAT', 'vatRate' => '15.25'])
            ->assertOk()->assertJsonPath('taxSetting.vatRate', '15.25');

        $this->assertDatabaseHas('tax_settings', ['id' => 1, 'tax_status' => 'NON_VAT', 'vat_rate' => '15.25', 'updated_by_id' => $admin->id]);
    }

    public function test_cashier_cannot_modify_tax_configuration(): void
    {
        Sanctum::actingAs(User::factory()->endUser()->create());

        $this->getJson('/api/tax-settings')->assertForbidden();
        $this->putJson('/api/tax-settings', ['taxStatus' => 'NON_VAT', 'vatRate' => '15.00'])->assertForbidden();
        $this->assertSame('12.00', TaxSetting::query()->findOrFail(1)->vat_rate);
    }

    public function test_invalid_rate_and_vat_registered_activation_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->admin()->create());

        foreach (['-1', '100.01', '12.345', 'bad'] as $rate) {
            $this->putJson('/api/tax-settings', ['taxStatus' => 'NON_VAT', 'vatRate' => $rate])
                ->assertUnprocessable()->assertJsonValidationErrors('vatRate');
        }
        $this->putJson('/api/tax-settings', ['taxStatus' => 'VAT_REGISTERED', 'vatRate' => '12.00'])
            ->assertUnprocessable()->assertJsonValidationErrors('taxStatus');
    }
}
