<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\OpenAIService;

class JobController extends Controller
{
    public function index()
    {
        $jobs = Job::all();

        $user = Auth::user();
        if ($user && $user->user_type === 'jobseeker' && $user->profile) {
            $openai = new OpenAIService();
            $userSkills = $user->profile->skills ?? [];
            $userExperience = $user->profile->experience_level ?? 'entry';

            foreach ($jobs as $job) {
                $jobDescription = $job->title . ' ' . $job->description . ' ' . implode(' ', $job->requirements ?? []);
                $match = $openai->matchJobToUser($jobDescription, $userSkills, $userExperience);
                $job->match_score = $match['match_score'] ?? 0;
                $job->match_reasoning = $match['reasoning'] ?? '';
            }

            // Sort by match score descending
            $jobs = $jobs->sortByDesc('match_score')->values();
        }

        return response()->json($jobs);
    }

    public function show($id)
    {
        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }
        return response()->json($job);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'string|in:full-time,part-time,contract',
            'salary' => 'numeric|min:0',
            'requirements' => 'array',
        ]);

        $user = Auth::user();

        // Only employers can create jobs
        if ($user->user_type !== 'employer') {
            return response()->json(['message' => 'Only employers can create jobs'], 403);
        }

        $job = Job::create(array_merge($validated, ['user_id' => $user->id]));

        return response()->json($job, 201);
    }

    public function update(Request $request, $id)
    {
        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $user = Auth::user();

        // Only the job owner can update the job
        if ($job->user_id !== $user->id) {
            return response()->json(['message' => 'You can only update your own jobs'], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'company' => 'string|max:255',
            'location' => 'string|max:255',
            'type' => 'string|in:full-time,part-time,contract',
            'salary' => 'numeric|min:0',
            'requirements' => 'array',
        ]);

        $job->update($validated);
        return response()->json($job);
    }

    public function destroy($id)
    {
        $job = Job::find($id);
        if (!$job) {
            return response()->json(['message' => 'Job not found'], 404);
        }

        $user = Auth::user();

        // Only the job owner can delete the job
        if ($job->user_id !== $user->id) {
            return response()->json(['message' => 'You can only delete your own jobs'], 403);
        }

        $job->delete();
        return response()->json(['message' => 'Job deleted']);
    }
}
