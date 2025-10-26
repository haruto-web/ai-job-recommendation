<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Services\OpenAIService;
use App\Models\Notification;

class JobController extends Controller
{
    public function index()
    {
        $jobs = Job::all();

        $user = Auth::user();
        if ($user && $user->user_type === 'jobseeker' && $user->profile) {
            $openai = new OpenAIService();
            
            // Use comprehensive AI analysis if available, otherwise fall back to basic skills
            $userSkills = [];
            $userExperience = 'entry';
            $userSummary = '';
            
            if ($user->profile->ai_analysis) {
                $aiAnalysis = $user->profile->ai_analysis;
                $userSkills = $aiAnalysis['skills'] ?? [];
                $userExperience = $aiAnalysis['experience_level'] ?? 'entry';
                $userSummary = $aiAnalysis['summary'] ?? '';
            } else {
                $userSkills = $user->profile->skills ?? [];
                $userExperience = $user->profile->experience_level ?? 'entry';
            }

            $highMatchJobs = [];

            foreach ($jobs as $job) {
                $jobDescription = $job->title . ' ' . $job->description . ' ' . implode(' ', $job->requirements ?? []);
                
                // Enhanced matching with AI analysis
                $matchData = [
                    'skills' => $userSkills,
                    'experience' => $userExperience,
                    'summary' => $userSummary
                ];
                
                $match = $openai->matchJobToUser($jobDescription, $userSkills, $userExperience);
                $job->match_score = $match['match_score'] ?? 0;
                $job->match_reasoning = $match['reasoning'] ?? '';
                
                // Track high match jobs for notifications
                if ($job->match_score >= 75) {
                    $highMatchJobs[] = $job;
                }
            }

            // Sort by match score descending
            $jobs = $jobs->sortByDesc('match_score')->values();
            
            // Send notification for high match jobs (only if user has AI analysis)
            if (!empty($highMatchJobs) && $user->profile->ai_analysis) {
                $this->notifyHighMatchJobs($user, $highMatchJobs);
            }
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
            'urgent' => 'boolean',
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
            'urgent' => 'boolean',
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

    public function search(Request $request)
    {
        $query = $request->input('q', '');
        if (empty($query)) {
            return response()->json(['jobs' => []]);
        }

        $jobs = Job::where('title', 'like', '%' . $query . '%')
            ->orWhere('description', 'like', '%' . $query . '%')
            ->orWhere('company', 'like', '%' . $query . '%')
            ->orWhere('location', 'like', '%' . $query . '%')
            ->limit(20)
            ->get();

        return response()->json(['jobs' => $jobs]);
    }

    public function urgentJobs()
    {
        $urgentJobs = Job::where('urgent', true)->get();
        return response()->json($urgentJobs);
    }

    /**
     * Notify user about high match jobs
     */
    private function notifyHighMatchJobs($user, $highMatchJobs)
    {
        try {
            // Check if we already sent a notification recently (within last 6 hours)
            $recentNotification = Notification::where('user_id', $user->id)
                ->where('type', 'high_job_match')
                ->where('created_at', '>=', now()->subHours(6))
                ->first();

            if (!$recentNotification) {
                $jobTitles = array_map(function($job) {
                    return $job->title;
                }, $highMatchJobs);

                $topMatch = $highMatchJobs[0] ?? null;
                $matchScore = $topMatch ? $topMatch->match_score : 0;

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'high_job_match',
                    'title' => '🎯 Perfect Job Matches Found!',
                    'message' => 'We found ' . count($highMatchJobs) . ' excellent job matches for you based on your resume! Your top match is "' . ($topMatch ? $topMatch->title : '') . '" with ' . $matchScore . '% compatibility.',
                    'data' => [
                        'job_ids' => array_map(function($job) {
                            return $job->id;
                        }, $highMatchJobs),
                        'match_count' => count($highMatchJobs),
                        'top_match_score' => $matchScore,
                        'top_match_title' => $topMatch ? $topMatch->title : null
                    ]
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send high match job notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
