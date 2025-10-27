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

        // Use local job matching to suggest jobs from existing database
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

        // Sort by confidence descending, but always return at least some jobs
        usort($scored, fn($a, $b) => $b['confidence'] <=> $a['confidence']);
        $suggestions = array_slice($scored, 0, $limit);

        return response()->json(['suggestions' => $suggestions]);
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

            $systemPrompt = "You are an AI career advisor chatbot for a job recommendation website. Help users with job search, career advice, skill development, resume tips, interview preparation, networking, salary negotiation, and job matching. Be friendly, helpful, and professional. Use the provided context about the user when relevant. If asked about specific jobs, reference available job listings. Provide actionable advice and keep responses concise but informative. Always encourage next steps and offer to help further.";

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

    public function chatResume(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120'
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $file = $request->file('resume');

        // If OpenAI key is not configured, provide fallback
        if (!is_string(config('services.openai.api_key')) || trim(config('services.openai.api_key')) === '') {
            Log::info('OpenAI API key not configured - using fallback for resume analysis in chat', ['user_id' => $user->id]);
            return response()->json(['response' => 'Resume analysis is currently unavailable. Please try again later or upload your resume through the profile page for analysis.']);
        }

        try {
            $openai = new OpenAIService();

            // Parse resume text
            $parser = new \App\Services\ResumeParserService();
            $resumeText = $parser->parseResume($file->getRealPath());

            if (empty($resumeText)) {
                return response()->json(['response' => 'I couldn\'t read your resume. Please ensure it\'s a valid PDF, DOC, or DOCX file.']);
            }

            // Extract skills and analyze
            $skills = $openai->extractSkillsFromResume($resumeText);
            $analysis = $openai->analyzeResumeComprehensively($resumeText);

            // Generate job suggestions based on extracted skills
            $jobSuggestions = $openai->suggestJobsForSkills($skills, $analysis['experience_years'] ?? '', 3);

            // Build response
            $response = "I've analyzed your resume! Here's what I found:\n\n";

            if (!empty($skills)) {
                $response .= "🔧 Your skills: " . implode(', ', $skills) . "\n\n";
            }

            if (!empty($analysis['experience_years'])) {
                $response .= "📅 Experience level: " . $analysis['experience_years'] . "\n\n";
            }

            if (!empty($analysis['summary'])) {
                $response .= "📝 Summary: " . $analysis['summary'] . "\n\n";
            }

            $response .= "💼 Based on your profile, here are some job suggestions:\n\n";
            foreach ($jobSuggestions as $job) {
                $response .= "• " . $job['title'] . " (" . ($job['confidence'] ?? $job['recommended_level'] ?? 'N/A') . ")\n";
                $response .= "  " . substr($job['description'], 0, 100) . "...\n\n";
            }

            $response .= "Would you like me to elaborate on any of these suggestions or help with your job search?";

            return response()->json(['response' => $response]);
        } catch (\Throwable $e) {
            Log::error('Resume chat analysis failed', ['error' => $e->getMessage()]);
            return response()->json(['response' => 'I encountered an issue analyzing your resume. Please try uploading it through your profile page instead, or contact support if the problem persists.']);
        }
    }

    private function generateFallbackResponse($message, $user)
    {
        $messageLower = strtolower($message);

        if (str_contains($messageLower, 'job') || str_contains($messageLower, 'find') || str_contains($messageLower, 'search')) {
            return "I'd love to help you find jobs! Please share your skills and experience, or check out our job listings page. You can also use the skills input below to get personalized recommendations.";
        } elseif (str_contains($messageLower, 'skill') || str_contains($messageLower, 'learn')) {
            return "Skills are key to career growth! What skills are you interested in developing? I can suggest learning paths, online courses, or how to highlight them on your resume.";
        } elseif (str_contains($messageLower, 'resume') || str_contains($messageLower, 'cv')) {
            return "A strong resume is essential for job hunting. Focus on quantifiable achievements, relevant skills, and tailoring it to each job. Upload your resume for AI-powered analysis and suggestions!";
        } elseif (str_contains($messageLower, 'interview')) {
            return "Interview preparation is crucial! Practice common questions like 'Tell me about yourself' and 'Why do you want this job.' Research the company, prepare questions for them, and be ready to discuss your experience and fit for the role.";
        } elseif (str_contains($messageLower, 'career') || str_contains($messageLower, 'advice')) {
            return "Career planning is important! Consider your interests, strengths, and market trends. I can help with skill development, job searching, resume tips, and interview preparation.";
        } elseif (str_contains($messageLower, 'salary') || str_contains($messageLower, 'pay')) {
            return "Salary negotiation is an art! Research market rates for your role and experience level. Consider total compensation including benefits. Practice your negotiation pitch.";
        } elseif (str_contains($messageLower, 'network') || str_contains($messageLower, 'linkedin')) {
            return "Networking is powerful! Connect with professionals on LinkedIn, attend industry events, and join relevant communities. Many jobs are filled through referrals.";
        } else {
            return "I'm here to help with your job search and career advice. What can I assist you with today? You can ask about jobs, skills, resumes, interviews, career planning, or salary negotiation.";
        }
    }
}
