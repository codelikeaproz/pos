<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Station;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->string('search')->trim()->toString();

        $users = User::query()->with('station')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhereHas('station', fn ($stationQuery) => $stationQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy('name')
            ->paginate($this->pageSize($request))
            ->withQueryString();

        return UserResource::collection($users)->response();
    }

    public function options(): JsonResponse
    {
        return response()->json([
            'stations' => Station::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::query()->create($request->validated());

        return response()->json([
            'message' => 'Employee created successfully.',
            'user' => (new UserResource($user->load('station')))->resolve(),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'user' => (new UserResource($user->load('station')))->resolve(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $validatedData = $request->validated();

        if (blank($validatedData['password'] ?? null)) {
            unset($validatedData['password']);
        }

        $user = DB::transaction(function () use ($user, $validatedData) {
            $admins = User::query()->where('role', UserRole::Admin->value)->where('is_active', true)->orderBy('id')->lockForUpdate()->get(['id']);
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            if ($locked->is_active && $locked->role === UserRole::Admin && $validatedData['role'] !== UserRole::Admin->value && $admins->count() === 1) {
                abort(409, 'The system must have at least one administrator.');
            }

            $passwordChanged = filled($validatedData['password'] ?? null);
            $locked->update($validatedData);
            if ($passwordChanged) {
                $locked->tokens()->delete();
            }

            return $locked;
        });

        return response()->json([
            'message' => 'Employee updated successfully.',
            'user' => (new UserResource($user->fresh()->load('station')))->resolve(),
        ]);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $isActive = $request->validate(['is_active' => ['required', 'boolean']])['is_active'];

        if (! $isActive && $request->user()->is($user)) {
            return response()->json([
                'message' => 'You cannot deactivate your own account while signed in.',
            ], 409);
        }

        $user = DB::transaction(function () use ($user, $isActive) {
            $activeAdmins = User::query()->where('role', UserRole::Admin->value)->where('is_active', true)->orderBy('id')->lockForUpdate()->get(['id']);
            $locked = User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            if (! $isActive && $locked->is_active && $locked->role === UserRole::Admin && $activeAdmins->count() === 1) {
                abort(409, 'The system must have at least one administrator.');
            }

            $locked->update(['is_active' => $isActive]);
            if (! $isActive) {
                $locked->tokens()->delete();
            }

            return $locked;
        });

        return response()->json([
            'message' => $isActive ? 'Employee reactivated successfully.' : 'Employee deactivated successfully.',
            'user' => (new UserResource($user->fresh()->load('station')))->resolve(),
        ]);
    }
}
