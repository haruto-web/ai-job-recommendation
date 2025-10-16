<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class ApplicationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->user_type === 'employer') {
            // Employers see applications for their jobs
            $applications = Application::whereHas('job', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['user', 'job'])->get();
        } else {
            // Job seekers see their own applications
            $applications = Application::where('user_id', $user->id)->with('job')->get();
        }

        return response()->json($applications);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:job_listings,id',
            'cover_letter' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Check if user already applied
        $existingApplication = Application::where('user_id', $user->id)
            ->where('job_id', $validated['job_id'])
            ->first();

        if ($existingApplication) {
            return response()->json(['message' => 'You have already applied for this job'], Response::HTTP_CONFLICT);
        }

        // Check if user is employer (employers can't apply for jobs)
        if ($user->user_type === 'employer') {
            return response()->json(['message' => 'Employers cannot apply for jobs'], Response::HTTP_FORBIDDEN);
        }

        $application = Application::create([
            'user_id' => $user->id,
            'job_id' => $validated['job_id'],
            'status' => 'pending',
            'cover_letter' => $validated['cover_letter'] ?? null,
        ]);

        return response()->json($application->load('job'), Response::HTTP_CREATED);
    }

    public function update(Request $request, $id)
    {
        $application = Application::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();

        // Only employers can update application status
        if ($user->user_type !== 'employer') {
            return response()->json(['message' => 'Only employers can update application status'], Response::HTTP_FORBIDDEN);
        }

        // Check if employer owns the job
        if ($application->job->user_id !== $user->id) {
            return response()->json(['message' => 'You can only update applications for your own jobs'], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,accepted,rejected',
        ]);

        $application->update($validated);

        return response()->json($application->load(['user', 'job']));
    }

    public function destroy($id)
    {
        $application = Application::find($id);
        if (!$application) {
            return response()->json(['message' => 'Application not found'], Response::HTTP_NOT_FOUND);
        }

        $user = Auth::user();

        // Users can only delete their own applications, employers can delete applications for their jobs
        if ($application->user_id !== $user->id && $application->job->user_id !== $user->id) {
            return response()->json(['message' => 'You can only delete your own applications or applications for your jobs'], Response::HTTP_FORBIDDEN);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted']);
    }
}
