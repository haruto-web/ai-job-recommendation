<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\OpenAIService;
use App\Models\Job;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AiController extends Controller
{
    public function skillChat(Request $request)
    {
        $request->validate([
            'skills' => 'required|array',
            'experience' => 'nullable|string',
            'limit' => 'nullable|integer|min:1|max:10'
        ]);

        $user = Auth::user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $skills = $request->input('skills');
        $experience = $request->input('experience', '');
        $limit = $request->input('limit', 5);

        // If OpenAI key is not configured, fall back to local job-matching heuristics
        if (! is_string(config('services.openai.api_key')) || trim(config('services.openai.api_key')) === '') {
            Log::info('OpenAI API key not configured - using local fallback for job suggestions', ['user_id' => $user->id]);

            $jobs = Job::all();
            $skillsLower = array_map(fn($s) => strtolower($s), $skills);

            $scored = [];
            foreach ($jobs as $job) {
                $text = strtolower($job->title . ' ' . ($job->description ?? '') . ' ' . ($job->requirements ? json_encode($job->requirements) : ''));
                $matchCount = 0;
                foreach ($skillsLower as $skill) {
                    if ($skill === '') continue;
                    if (str_contains($text, $skill)) $matchCount++;
                }
                $confidence = $matchCount > 0 ? min(100, (int) floor(($matchCount / max(1, count($skillsLower))) * 100)) : 0;

                    $scored[] = [
                        'job_id' => $job->id,
                        'title' => $job->title,
                        'description' => strlen($job->description ?? '') > 200 ? substr($job->description, 0, 197) . '...' : ($job->description ?? ''),
                        'recommended_level' => $job->type ?? 'mid',
                        'confidence' => $confidence,
                    ];
            }

            usort($scored, fn($a, $b) => $b['confidence'] <=> $a['confidence']);
            $suggestions = array_slice($scored, 0, $limit);

            return response()->json(['suggestions' => $suggestions]);
        }

        try {
            $openai = new OpenAIService();
            $suggestions = $openai->suggestJobsForSkills($skills, $experience, $limit);

            // Try to attach job_id when OpenAI returns titles by matching to existing jobs
            foreach ($suggestions as &$s) {
                if (isset($s['job_id'])) continue;
                if (empty($s['title'])) continue;
                $found = Job::where('title', 'like', '%' . substr($s['title'], 0, 50) . '%')->first();
                $s['job_id'] = $found ? $found->id : null;
            }

            return response()->json(['suggestions' => $suggestions]);
        } catch (\Throwable $e) {
            Log::error('AI skillChat failed', ['error' => $e->getMessage()]);

            // Fallback to local matching if AI call fails
            $jobs = Job::all();
            $skillsLower = array_map(fn($s) => strtolower($s), $skills);
            $scored = [];
            foreach ($jobs as $job) {
                $text = strtolower($job->title . ' ' . ($job->description ?? '') . ' ' . ($job->requirements ? json_encode($job->requirements) : ''));
                $matchCount = 0;
                foreach ($skillsLower as $skill) {
                    if ($skill === '') continue;
                    if (str_contains($text, $skill)) $matchCount++;
                }
                $confidence = $matchCount > 0 ? min(100, (int) floor(($matchCount / max(1, count($skillsLower))) * 100)) : 0;
                $scored[] = [
                    'title' => $job->title,
                    'description' => strlen($job->description ?? '') > 200 ? substr($job->description, 0, 197) . '...' : ($job->description ?? ''),
                    'recommended_level' => $job->type ?? 'mid',
                    'confidence' => $confidence,
                ];
            }
            usort($scored, fn($a, $b) => $b['confidence'] <=> $a['confidence']);
            $suggestions = array_slice($scored, 0, $limit);

            return response()->json(['suggestions' => $suggestions]);
        }
    }

    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $message = $request->input('message');

        // If OpenAI key is not configured, provide a simple fallback response
        if (!is_string(config('services.openai.api_key')) || trim(config('services.openai.api_key')) === '') {
            Log::info('OpenAI API key not configured - using simple fallback for chat', ['user_id' => $user->id]);

            $response = $this->generateFallbackResponse($message, $user);
            return response()->json(['response' => $response]);
        }

        try {
            $openai = new OpenAIService();

            // Build context from user's profile if available
            $context = '';
            if ($user->profile) {
                $profile = $user->profile;
                $skills = $profile->ai_analysis['skills'] ?? [];
                $experience = $profile->extracted_experience ?? '';
                $context = "User skills: " . implode(', ', $skills) . ". Experience: $experience.";
            }

            $systemPrompt = "You are an AI career advisor chatbot for a job recommendation website. Help users with job search, career advice, skill development, resume tips, and job matching. Be friendly, helpful, and professional. Use the provided context about the user when relevant. If asked about specific jobs, reference available job listings. Keep responses concise but informative.";

            $response = $openai->getClient()->chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt . ' ' . $context],
                    ['role' => 'user', 'content' => $message]
                ],
                'max_tokens' => 500,
            ]);

            $aiResponse = $response->choices[0]->message->content;

            return response()->json(['response' => $aiResponse]);
        } catch (\Throwable $e) {
            Log::error('AI chat failed', ['error' => $e->getMessage()]);

            // Fallback response
            $response = $this->generateFallbackResponse($message, $user);
            return response()->json(['response' => $response]);
        }
    }

    private function generateFallbackResponse($message, $user)
    {
        $messageLower = strtolower($message);

        if (str_contains($messageLower, 'job') || str_contains($messageLower, 'find') || str_contains($messageLower, 'search')) {
            return "I'd love to help you find jobs! Please share your skills and experience, or check out our job listings page.";
        } elseif (str_contains($messageLower, 'skill') || str_contains($messageLower, 'learn')) {
            return "Skills are key to career growth! What skills are you interested in developing? I can provide general advice.";
        } elseif (str_contains($messageLower, 'resume') || str_contains($messageLower, 'cv')) {
            return "A strong resume is essential. Focus on quantifiable achievements and relevant skills. Upload your resume for AI analysis!";
        } elseif (str_contains($messageLower, 'interview')) {
            return "Practice common interview questions and research the company. Be prepared to discuss your experience and fit for the role.";
        } else {
            return "I'm here to help with your job search and career advice. What can I assist you with today?";
        }
    }
}
