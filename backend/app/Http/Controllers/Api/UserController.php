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
            ->paginate(10)
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

        if (
            $user->role === UserRole::Admin
            && $validatedData['role'] === UserRole::EndUser->value
            && User::query()->where('role', UserRole::Admin->value)->count() === 1
        ) {
            abort(409, 'The system must have at least one administrator.');
        }

        $user->update($validatedData);

        return response()->json([
            'message' => 'Employee updated successfully.',
            'user' => (new UserResource($user->fresh()->load('station')))->resolve(),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->is($user)) {
            return response()->json([
                'message' => 'You cannot delete your own account while signed in.',
            ], 409);
        }

        if (
            $user->role === UserRole::Admin
            && User::query()->where('role', UserRole::Admin->value)->count() === 1
        ) {
            abort(409, 'The system must have at least one administrator.');
        }

        $user->delete();

        return response()->json([
            'message' => 'Employee deleted successfully.',
        ]);
    }
}
