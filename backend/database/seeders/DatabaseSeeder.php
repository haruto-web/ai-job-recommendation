<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Job;
use App\Models\Application;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users
        $jobseeker = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'jobseeker@example.com',
            'user_type' => 'jobseeker',
        ]);

        $employer = User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'employer@example.com',
            'user_type' => 'employer',
        ]);

        // Create sample jobs
        $jobs = [
            [
                'title' => 'Senior Software Developer',
                'description' => 'We are looking for an experienced software developer to join our team.',
                'company' => 'Tech Corp',
                'location' => 'New York, NY',
                'type' => 'full-time',
                'salary' => 120000,
                'requirements' => ['PHP', 'Laravel', 'JavaScript', 'React'],
                'user_id' => $employer->id,
            ],
            [
                'title' => 'Frontend Developer',
                'description' => 'Join our team as a frontend developer working on modern web applications.',
                'company' => 'Web Solutions Inc',
                'location' => 'San Francisco, CA',
                'type' => 'full-time',
                'salary' => 95000,
                'requirements' => ['JavaScript', 'React', 'CSS', 'HTML'],
                'user_id' => $employer->id,
            ],
            [
                'title' => 'Backend Developer',
                'description' => 'Looking for a backend developer with experience in Laravel and API development.',
                'company' => 'Data Systems',
                'location' => 'Austin, TX',
                'type' => 'contract',
                'salary' => 80000,
                'requirements' => ['PHP', 'Laravel', 'MySQL', 'API'],
                'user_id' => $employer->id,
            ],
            [
                'title' => 'Full Stack Developer',
                'description' => 'Full stack developer needed for exciting startup project.',
                'company' => 'StartupXYZ',
                'location' => 'Remote',
                'type' => 'part-time',
                'salary' => 60000,
                'requirements' => ['JavaScript', 'Node.js', 'React', 'MongoDB'],
                'user_id' => $employer->id,
            ],
        ];

        foreach ($jobs as $jobData) {
            Job::create($jobData);
        }

        // Create sample applications for the jobseeker
        $sampleJobs = Job::take(2)->get(); // Get first 2 jobs
        foreach ($sampleJobs as $job) {
            Application::create([
                'user_id' => $jobseeker->id,
                'job_id' => $job->id,
                'status' => 'pending',
            ]);
        }

        // Create one accepted application
        Application::create([
            'user_id' => $jobseeker->id,
            'job_id' => $sampleJobs->last()->id,
            'status' => 'accepted',
        ]);
    }
}
