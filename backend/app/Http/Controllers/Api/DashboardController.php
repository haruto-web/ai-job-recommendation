<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\Payment;
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
        } elseif ($user->user_type === 'admin') {
            return $this->adminDashboard($user);
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

        $transactions = Payment::where('jobseeker_id', $user->id)
            ->with(['application.job', 'employer'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => $payment->amount,
                    'type' => 'earned',
                    'description' => $payment->description,
                    'date' => $payment->processed_at->format('Y-m-d'),
                ];
            });

        $totalEarnings = $transactions->sum('amount');

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

        $transactions = Payment::where('employer_id', $user->id)
            ->with(['application.job', 'jobseeker'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                $amount = $payment->amount !== null ? (float) $payment->amount : 0.0;
                $type = 'paid';

                if ($payment->type === 'money_added') {
                    $type = 'added';
                } elseif ($payment->type === 'money_reduced') {
                    $type = 'reduced';
                    $amount = -((float)$amount);
                } else {
                    $amount = -((float)$amount); // Regular payments are negative
                }

                return [
                    'id' => $payment->id,
                    'amount' => $amount,
                    'type' => $type,
                    'description' => $payment->description,
                    'date' => $payment->processed_at->format('Y-m-d'),
                ];
            });

        // Compute employer balance by summing signed transaction amounts.
        // 'added' -> positive, 'reduced'/'paid' -> negative as set above.
        $totalSpent = (float) $transactions->sum('amount');

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

    private function adminDashboard(User $user)
    {
        // User statistics
        $totalUsers = User::count();
        $jobseekers = User::where('user_type', 'jobseeker')->count();
        $employers = User::where('user_type', 'employer')->count();
        $admins = User::where('user_type', 'admin')->count();

        // Job statistics
        $totalJobs = Job::count();
        $urgentJobs = Job::where('urgent', true)->count();

        // Application statistics
        $totalApplications = Application::count();
        $pendingApplications = Application::where('status', 'pending')->count();
        $acceptedApplications = Application::where('status', 'accepted')->count();
        $rejectedApplications = Application::where('status', 'rejected')->count();

        // Payment statistics
        $totalPayments = Payment::count();
        $totalPaymentAmount = Payment::sum('amount');

        // Recent users
        $recentUsers = User::with('profile')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'user_type' => $user->user_type,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Recent jobs
        $recentJobs = Job::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'company' => $job->company,
                    'user' => $job->user ? $job->user->name : 'Unknown',
                    'urgent' => $job->urgent,
                    'created_at' => $job->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Recent applications
        $recentApplications = Application::with(['user', 'job'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'job_title' => $app->job->title,
                    'user_name' => $app->user->name,
                    'status' => $app->status,
                    'created_at' => $app->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'user_type' => 'admin',
            'summary' => [
                'total_users' => $totalUsers,
                'jobseekers' => $jobseekers,
                'employers' => $employers,
                'admins' => $admins,
                'total_jobs' => $totalJobs,
                'urgent_jobs' => $urgentJobs,
                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'accepted_applications' => $acceptedApplications,
                'rejected_applications' => $rejectedApplications,
                'total_payments' => $totalPayments,
                'total_payment_amount' => $totalPaymentAmount,
            ],
            'graphs' => [
                'user_types' => [
                    'jobseeker' => $jobseekers,
                    'employer' => $employers,
                    'admin' => $admins,
                ],
                'application_status' => [
                    'pending' => $pendingApplications,
                    'accepted' => $acceptedApplications,
                    'rejected' => $rejectedApplications,
                ],
            ],
            'recent_users' => $recentUsers,
            'recent_jobs' => $recentJobs,
            'recent_applications' => $recentApplications,
        ]);
    }
}
