<?php

namespace App\Http\Requests;

use App\Models\Privilege;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePrivilegeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['description' => trim((string) $this->input('description'))]);
    }

    public function rules(): array
    {
        return ['description' => ['required', 'string', 'max:100', function (string $attribute, mixed $value, Closure $fail) {
            $duplicate = Privilege::query()->whereRaw('LOWER(description) = ?', [mb_strtolower((string) $value)])
                ->whereKeyNot($this->route('privilege')->getKey())->exists();
            if ($duplicate) {
                $fail('The description has already been taken.');
            }
        }]];
    }
}
