<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->user_type === 'jobseeker') {
            return $this->jobseekerDashboard($user);
        } elseif ($user->user_type === 'employer') {
            return $this->employerDashboard($user);
        }

        return response()->json(['message' => 'Invalid user type'], 400);
    }

    private function jobseekerDashboard(User $user)
    {
        $applications = Application::where('user_id', $user->id)
            ->with('job')
            ->get();

        $incomingProjects = Application::where('user_id', $user->id)
            ->where('status', 'accepted')
            ->with('job')
            ->get();

        $profile = $user->profile; // Assuming User has profile relationship

        $transactions = [
            ['id' => 1, 'amount' => 500, 'type' => 'earned', 'description' => 'Payment for completed project', 'date' => '2024-10-15'],
            ['id' => 2, 'amount' => 200, 'type' => 'earned', 'description' => 'Freelance work', 'date' => '2024-10-10'],
        ];

        $totalEarnings = array_sum(array_column($transactions, 'amount'));

        return response()->json([
            'user_type' => 'jobseeker',
            'applications' => $applications,
            'incoming_projects' => $incomingProjects,
            'profile' => $profile,
            'transactions' => $transactions,
            'total_earnings' => $totalEarnings,
        ]);
    }

    private function employerDashboard(User $user)
    {
        $jobs = Job::where('user_id', $user->id)->with('applications')->get();

        $applications = Application::whereHas('job', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with(['user', 'job'])->get();

        $workingOnJobs = Application::whereHas('job', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('status', 'accepted')->with(['user', 'job'])->get();

        $transactions = [
            ['id' => 1, 'amount' => -300, 'type' => 'paid', 'description' => 'Payment to freelancer', 'date' => '2024-10-14'],
            ['id' => 2, 'amount' => -150, 'type' => 'paid', 'description' => 'Project payment', 'date' => '2024-10-12'],
        ];

        $totalSpent = abs(array_sum(array_column($transactions, 'amount')));

        return response()->json([
            'user_type' => 'employer',
            'jobs' => $jobs,
            'applications' => $applications,
            'working_on_jobs' => $workingOnJobs,
            'transactions' => $transactions,
            'total_spent' => $totalSpent,
            'active_jobs' => $jobs->count(),
            'total_applications' => $applications->count(),
        ]);
    }
}
