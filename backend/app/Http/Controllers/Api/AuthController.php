<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Services\ResumeParserService;
use App\Services\OpenAIService;



class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
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

            /** @var \App\Models\User $user */
            $token = $user->createToken('API Token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
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
        if ($user->getAttribute('profile_image')) {
            Storage::disk('public')->delete($user->getAttribute('profile_image'));
        }

        $path = $request->file('profile_image')->store('avatars', 'public');

        $user->setAttribute('profile_image', $path);
        $user->save();

        return response()->json($user);
    }

    public function user(Request $request)
    {
        return response()->json($request->user()->load('profile'));
    }

  public function updateProfile(Request $request)
    {
        $request->validate([
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'experience_level' => 'nullable|in:entry,mid,senior,expert',
            'portfolio_url' => 'nullable|url',
        ]);

        $user = $request->user();

        // Ensure user has a profile
        $profile = $this->ensureProfile($user);

        $profile->update($request->only(['bio', 'skills', 'experience_level', 'portfolio_url']));

        return response()->json($user->load('profile'));
    }
     private function extractAndMergeSkills($path, $profile)
    {
        try {
            // Try to instantiate parser safely (avoid autoload fatal)
            try {
                $parser = new ResumeParserService();
            } catch (\Throwable $e) {
                Log::error('Could not instantiate ResumeParserService', ['error' => $e->getMessage()]);
                return;
            }

            // parseResume should return text; guard if empty
            $resumeText = '';
            try {
                $resumeText = $parser->parseResume(storage_path('app/public/' . $path));
            } catch (\Throwable $e) {
                Log::error('Failed to parse resume file', ['path' => $path, 'error' => $e->getMessage()]);
            }

            if (empty($resumeText)) {
                Log::info('extractAndMergeSkills: no text extracted from resume', ['path' => $path]);
                return;
            }

            $extractedSkills = [];

            try {
                if (class_exists(OpenAIService::class)) {
                    $openai = new OpenAIService();
                    $extractedSkills = $openai->extractSkillsFromResume($resumeText) ?? [];
                } else {
                    Log::info('OpenAIService not installed; skipping skill extraction');
                }
            } catch (\Throwable $e) {
                Log::error('OpenAI skill extraction failed', ['error' => $e->getMessage()]);
            }

            // Merge with existing skills
            $existingSkills = is_array($profile->skills) ? $profile->skills : ($profile->skills ?? []);
            $mergedSkills = array_values(array_unique(array_merge($existingSkills, $extractedSkills)));
            $profile->update(['skills' => $mergedSkills]);
        } catch (\Throwable $e) {
            Log::error('extractAndMergeSkills exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        }
    }
     public function uploadResume(Request $request)
    {
        Log::info('uploadResume called', [
            'user_id' => $request->user()?->id,
            'has_file' => $request->hasFile('resume'),
            'action' => $request->input('action'),
            'all_inputs' => $request->except('resume')
        ]);

        try {
            $user = $request->user();

            if (! $user) {
                Log::warning('uploadResume: unauthenticated');
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // ensure profile exists
            $profile = $this->ensureProfile($user);

            $resumes = $profile->resumes ?? [];

            if ($request->has('action')) {
                $action = $request->input('action');
                $index = $request->input('index');

                if ($action === 'add' && $request->hasFile('resume')) {
                    $request->validate([
                        'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
                        'name' => 'required|string|max:255',
                    ]);

                    $path = $request->file('resume')->store('resumes', 'public');

                    $resumes[] = [
                        'name' => $request->input('name'),
                        'url' => $path,
                    ];

                    // Extract skills asynchronously or best-effort
                    $this->extractAndMergeSkills($path, $profile);
                } elseif ($action === 'replace' && isset($index) && isset($resumes[$index]) && $request->hasFile('resume')) {
                    $request->validate([
                        'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
                    ]);

                    Storage::disk('public')->delete($resumes[$index]['url']);

                    $path = $request->file('resume')->store('resumes', 'public');
                    $resumes[$index]['url'] = $path;

                    $this->extractAndMergeSkills($path, $profile);
                } elseif ($action === 'delete' && isset($index) && isset($resumes[$index])) {
                    Storage::disk('public')->delete($resumes[$index]['url']);
                    unset($resumes[$index]);
                    $resumes = array_values($resumes);
                } else {
                   Log::warning('uploadResume: invalid action', ['action' => $action]);
                    return response()->json(['error' => 'Invalid action or parameters'], 400);
                }
            } elseif ($request->hasFile('resume')) {
                // Legacy single resume upload
                $request->validate([
                    'resume' => 'required|file|mimes:pdf,doc,docx|max:5120',
                ]);

                if ($profile->resume_url) {
                    Storage::disk('public')->delete($profile->resume_url);
                }

                $path = $request->file('resume')->store('resumes', 'public');
                $profile->update(['resume_url' => $path]);

                $this->extractAndMergeSkills($path, $profile);
                return response()->json($user->load('profile'));
            } else {
                return response()->json(['error' => 'No action or file provided'], 400);
            }

            $profile->update(['resumes' => $resumes]);

            Log::info('uploadResume: updated profile', [
                'user_id' => $user->id,
                'resumes_count' => count($resumes),
            ]);

            return response()->json($user->load('profile'));
        } catch (\Throwable $e) {
           Log::error('uploadResume exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Server error: '.$e->getMessage()], 500);
        }
    }

    /**
     * Ensure the given user has a profile record and return it.
     */
    private function ensureProfile(User $user)
    {
        return $user->profile ?: $user->profile()->create([]);
    }
}
