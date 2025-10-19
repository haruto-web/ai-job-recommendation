<?php

use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\StorageController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{id}', [JobController::class, 'show']);

// Email verification and password reset (public)
Route::post('send-email-verification', [AuthController::class, 'sendEmailVerification']);
Route::post('verify-email', [AuthController::class, 'verifyEmail']);
Route::post('send-password-reset', [AuthController::class, 'sendPasswordResetLink']);
Route::post('reset-password', [AuthController::class, 'resetPassword']);

// Storage route for serving files
Route::get('/storage/{path}', [StorageController::class, 'show'])->where('path', '.*');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
    Route::put('user', [AuthController::class, 'updateUser']);
    Route::put('user/profile', [AuthController::class, 'updateProfile']);
    Route::post('user/profile-image', [AuthController::class, 'uploadProfileImage']);
    Route::post('user/resume', [AuthController::class, 'uploadResume']);
    Route::get('user/resume-analysis', [AuthController::class, 'getResumeAnalysis']);
    Route::post('user/trigger-ai-analysis', [AuthController::class, 'triggerAiAnalysis']);
    Route::get('user/notifications', [AuthController::class, 'getNotifications']);
    Route::put('user/notifications/{id}/read', [AuthController::class, 'markNotificationAsRead']);
    Route::put('user/notifications/read-all', [AuthController::class, 'markAllNotificationsAsRead']);
    Route::post('jobs', [JobController::class, 'store']);
    Route::put('jobs/{id}', [JobController::class, 'update']);
    Route::delete('jobs/{id}', [JobController::class, 'destroy']);

    // Applications
    Route::get('applications', [ApplicationController::class, 'index']);
    Route::post('applications', [ApplicationController::class, 'store']);
    Route::put('applications/{id}', [ApplicationController::class, 'update']);
    Route::delete('applications/{id}', [ApplicationController::class, 'destroy']);

    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index']);
});
