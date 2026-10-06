<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SyncUserPrivilegesRequest;
use App\Models\Privilege;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrivilegeAssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate(['search' => ['nullable', 'string', 'max:100']]);
        $search = trim($validated['search'] ?? '');
        $users = User::query()->with('privileges:id,description')
            ->when($search !== '', fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
            ->orderBy('name')->paginate($this->pageSize($request))->withQueryString();

        return response()->json([
            'data' => $users->getCollection()->map(fn (User $user) => [
                'id' => $user->id, 'name' => $user->name, 'email' => $user->email,
                'role' => $user->role->value, 'privilegeIds' => $user->privileges->pluck('id')->values(),
            ]),
            'privileges' => Privilege::query()->orderBy('description')->get(['id', 'description']),
            'meta' => ['current_page' => $users->currentPage(), 'last_page' => $users->lastPage(), 'total' => $users->total()],
        ]);
    }

    public function update(SyncUserPrivilegesRequest $request, User $user): JsonResponse
    {
        DB::transaction(fn () => $user->privileges()->sync($request->validated('privilege_ids')));

        return response()->json(['message' => 'Privilege assignments updated successfully.']);
    }
}
