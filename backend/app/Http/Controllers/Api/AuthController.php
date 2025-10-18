<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;



class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            Log::info('Registration attempt', $request->all());

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'user_type' => 'required|in:jobseeker,employer',
            ], [
                'email.unique' => 'This email is already registered. Please use a different email or try logging in.',
            ]);

            Log::info('Validation passed for registration');

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => $request->user_type,
            ]);

            Log::info('User created successfully', ['user_id' => $user->id, 'email' => $user->email]);

            $token = $user->createToken('API Token')->plainTextToken;

            Log::info('Token generated for user', ['user_id' => $user->id]);

            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            throw $e;
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function updateUser(Request $request)
    {
        $request->validate([
            'user_type' => 'required|in:jobseeker,employer',
        ]);

        $user = $request->user();
        $user->update($request->only('user_type'));

        return response()->json($user);
    }

    public function uploadProfileImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user();

        // Delete old image if exists
        if ($user->profile_image) {
            Storage::disk('public')->delete($user->profile_image);
        }

        $path = $request->file('profile_image')->store('avatars', 'public');

        $user->profile_image = $path;
        $user->save();

        return response()->json($user);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }

    public function uploadResume(Request $request)
    {
        $user = $request->user();

        // Ensure user has a profile
        if (!$user->profile) {
            $user->profile()->create();
        }

        $resumes = $user->profile->resumes ?? [];

        if ($request->has('action')) {
            $action = $request->input('action');
            $index = $request->input('index');

            if ($action === 'add' && $request->hasFile('resume')) {
                // Add new resume
                $request->validate([
                    'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
                    'name' => 'required|string|max:255',
                ]);

                $path = $request->file('resume')->store('resumes', 'public');
                $resumes[] = [
                    'name' => $request->input('name'),
                    'url' => $path,
                ];
            } elseif ($action === 'replace' && isset($index) && isset($resumes[$index]) && $request->hasFile('resume')) {
                // Replace specific resume
                $request->validate([
                    'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
                ]);

                // Delete old file
                Storage::disk('public')->delete($resumes[$index]['url']);

                $path = $request->file('resume')->store('resumes', 'public');
                $resumes[$index]['url'] = $path;
            } elseif ($action === 'delete' && isset($index) && isset($resumes[$index])) {
                // Delete specific resume
                Storage::disk('public')->delete($resumes[$index]['url']);
                unset($resumes[$index]);
                $resumes = array_values($resumes); // Reindex array
            } else {
                return response()->json(['error' => 'Invalid action or parameters'], 400);
            }
        } elseif ($request->hasFile('resume')) {
            // Legacy: Upload single resume (for backward compatibility)
            $request->validate([
                'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
            ]);

            // Delete old resume if exists
            if ($user->profile->resume_url) {
                Storage::disk('public')->delete($user->profile->resume_url);
            }

            $path = $request->file('resume')->store('resumes', 'public');
            $user->profile->update(['resume_url' => $path]);
            return response()->json($user->load('profile'));
        } elseif ($request->input('resume') === null) {
            // Legacy: Delete single resume
            if ($user->profile->resume_url) {
                Storage::disk('public')->delete($user->profile->resume_url);
                $user->profile->update(['resume_url' => null]);
            }
            return response()->json($user->load('profile'));
        } else {
            return response()->json(['error' => 'Invalid request'], 400);
        }

        $user->profile->update(['resumes' => $resumes]);

        return response()->json($user->load('profile'));
    }
}
