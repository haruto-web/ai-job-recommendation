<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Job;
use App\Models\Application;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function getUsers(Request $request)
    {
        $query = User::with('profile');

        if ($request->has('user_type') && $request->user_type) {
            $query->where('user_type', $request->user_type);
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    public function getJobs(Request $request)
    {
        $query = Job::with('user');

        if ($request->has('urgent') && $request->urgent !== null) {
            $query->where('urgent', $request->boolean('urgent'));
        }

        $jobs = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($jobs);
    }

    public function getApplications(Request $request)
    {
        $query = Application::with(['user', 'job']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $applications = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($applications);
    }

    public function getPayments(Request $request)
    {
        $query = Payment::with(['application.job', 'jobseeker', 'employer']);

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'user_type' => 'sometimes|in:jobseeker,employer,admin',
            'password' => 'sometimes|string|min:8',
        ]);

        $data = $request->only(['name', 'email', 'user_type']);

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function deleteUser(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateJob(Request $request, Job $job)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'company' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:full-time,part-time,contract',
            'salary' => 'sometimes|numeric|nullable',
            'urgent' => 'sometimes|boolean',
        ]);

        $job->update($request->all());

        return response()->json(['message' => 'Job updated successfully', 'job' => $job]);
    }

    public function deleteJob(Job $job)
    {
        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }

    public function updateApplication(Request $request, Application $application)
    {
        $request->validate([
            'status' => 'required|in:pending,accepted,rejected',
        ]);

        $application->update($request->only(['status']));

        return response()->json(['message' => 'Application updated successfully', 'application' => $application]);
    }

    public function deleteApplication(Application $application)
    {
        $application->delete();

        return response()->json(['message' => 'Application deleted successfully']);
    }
}
