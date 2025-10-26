<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        if (empty($query)) {
            return response()->json(['users' => []]);
        }

        $users = User::with('profile')
            ->where('name', 'like', '%' . $query . '%')
            ->orWhere('email', 'like', '%' . $query . '%')
            ->limit(20)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'profile' => $user->profile ? [
                        'bio' => $user->profile->bio,
                        'skills' => $user->profile->skills,
                        'experience_level' => $user->profile->experience_level,
                    ] : null,
                ];
            });

        return response()->json(['users' => $users]);
    }
}
