<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_health_endpoint_returns_ok_json(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertOk()
            ->assertJson([
                'status' => 'ok',
                'application' => 'University HomeStay POS API',
            ]);
    }

    public function test_packaged_electron_origin_is_allowed(): void
    {
        $this->withHeader('Origin', 'pos://app')
            ->getJson('/api/health')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'pos://app');
    }

    public function test_untrusted_local_file_origin_is_not_allowed(): void
    {
        $this->withHeader('Origin', 'null')
            ->getJson('/api/health')
            ->assertOk()
            ->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
