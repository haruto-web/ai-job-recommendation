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
    ];

    protected $casts = [
        'requirements' => 'array',
        'salary' => 'float',
    ];
}
