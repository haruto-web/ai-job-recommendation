<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $table = 'job_listings';

    protected $fillable = [
        'title',
        'description',
        'company',
        'location',
        'type',
        'salary',
        'requirements',
        'user_id',
    ];

    protected $casts = [
        'requirements' => 'array',
        'salary' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'job_id');
    }
}
