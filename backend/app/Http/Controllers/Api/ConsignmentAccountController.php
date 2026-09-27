<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConsignmentAccountRequest;
use App\Http\Requests\UpdateConsignmentAccountRequest;
use App\Http\Resources\ConsignmentAccountResource;
use App\Models\Consignee;
use App\Models\Station;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsignmentAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searchTerm = $request->string('search')->trim()->toString();
        $accounts = User::query()->whereNotNull('consignee_id')->with(['station', 'consignee'])
            ->when($searchTerm !== '', fn ($query) => $query->where(fn ($search) => $search->where('name', 'like', "%{$searchTerm}%")->orWhere('email', 'like', "%{$searchTerm}%")))
            ->orderBy('name')->paginate(10)->withQueryString();

        return ConsignmentAccountResource::collection($accounts)->response();
    }

    public function options(): JsonResponse
    {
        return response()->json([
            'stations' => Station::query()->orderBy('name')->get(['id', 'name']),
            'consignees' => Consignee::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreConsignmentAccountRequest $request): JsonResponse
    {
        $account = User::query()->create([...$request->validated(), 'role' => UserRole::EndUser->value]);

        return response()->json(['message' => 'Account added successfully.', 'account' => (new ConsignmentAccountResource($account->load(['station', 'consignee'])))->resolve()], 201);
    }

    public function show(User $user): JsonResponse
    {
        $this->ensureConsignmentAccount($user);

        return response()->json(['account' => (new ConsignmentAccountResource($user->load(['station', 'consignee'])))->resolve()]);
    }

    public function update(UpdateConsignmentAccountRequest $request, User $user): JsonResponse
    {
        $this->ensureConsignmentAccount($user);
        $validatedData = $request->validated();
        if (blank($validatedData['password'] ?? null)) {
            unset($validatedData['password']);
        }
        $user->update($validatedData);

        return response()->json(['message' => 'Account updated successfully.', 'account' => (new ConsignmentAccountResource($user->fresh()->load(['station', 'consignee'])))->resolve()]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->ensureConsignmentAccount($user);
        if ($request->user()->is($user)) {
            return response()->json(['message' => 'You cannot delete your own account while signed in.'], 409);
        }
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully.']);
    }

    private function ensureConsignmentAccount(User $user): void
    {
        abort_if($user->consignee_id === null, 404);
    }
}
