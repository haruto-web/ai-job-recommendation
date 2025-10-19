<?php

namespace App\Services;

use OpenAI;

class OpenAIService
{
    protected $client;

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.api_key'));
    }

    public function extractSkillsFromResume($resumeText)
    {
        $response = $this->client->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an AI assistant that extracts skills from resume text. Return only a JSON array of skills.'
                ],
                [
                    'role' => 'user',
                    'content' => "Extract skills from this resume text: {$resumeText}"
                ]
            ],
            'max_tokens' => 500,
        ]);

        $content = $response->choices[0]->message->content;
        $skills = json_decode($content, true);

        return is_array($skills) ? $skills : [];
    }

    public function analyzeResumeComprehensively($resumeText)
    {
        $response = $this->client->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an AI assistant that analyzes resumes comprehensively. Extract detailed information and return a JSON object with the following structure:
                    {
                        "skills": ["skill1", "skill2"],
                        "experience_years": "X years",
                        "education": ["degree1", "degree2"],
                        "certifications": ["cert1", "cert2"],
                        "languages": ["language1", "language2"],
                        "summary": "Brief professional summary",
                        "strengths": ["strength1", "strength2"],
                        "experience_level": "entry|mid|senior|expert",
                        "key_achievements": ["achievement1", "achievement2"]
                    }'
                ],
                [
                    'role' => 'user',
                    'content' => "Analyze this resume comprehensively: {$resumeText}"
                ]
            ],
            'max_tokens' => 1000,
        ]);

        $content = $response->choices[0]->message->content;
        $analysis = json_decode($content, true);

        return $analysis ?: [
            'skills' => [],
            'experience_years' => 'Unknown',
            'education' => [],
            'certifications' => [],
            'languages' => [],
            'summary' => 'Unable to generate summary',
            'strengths' => [],
            'experience_level' => 'entry',
            'key_achievements' => []
        ];
    }

    public function matchJobToUser($jobDescription, $userSkills, $userExperience)
    {
        $skillsString = implode(', ', $userSkills);

        $response = $this->client->chat()->create([
            'model' => 'gpt-3.5-turbo',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an AI assistant that matches jobs to users based on skills and experience. Return only a JSON object with "match_score" (0-100) and "reasoning".'
                ],
                [
                    'role' => 'user',
                    'content' => "Job: {$jobDescription}\nUser Skills: {$skillsString}\nExperience: {$userExperience}\nCalculate match score."
                ]
            ],
            'max_tokens' => 300,
        ]);

        $content = $response->choices[0]->message->content;
        $result = json_decode($content, true);

        return $result ?: ['match_score' => 0, 'reasoning' => 'Unable to calculate match'];
    }
}
