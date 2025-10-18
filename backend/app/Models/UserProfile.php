<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'skills',
        'experience_level',
        'portfolio_url',
        'resume_url',
        'resumes',
    ];

    protected $casts = [
        'skills' => 'array',
        'resumes' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
