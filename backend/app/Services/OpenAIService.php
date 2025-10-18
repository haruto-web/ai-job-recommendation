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
