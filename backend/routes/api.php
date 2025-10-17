<?php

use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{id}', [JobController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
    Route::put('user', [AuthController::class, 'updateUser']);
    Route::post('user/profile-image', [AuthController::class, 'uploadProfileImage']);
    Route::put('user/resume', [AuthController::class, 'uploadResume']);
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
