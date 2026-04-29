<?php

namespace App\Models;

use Database\Factories\LeaveTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'days_allowed'];

    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }
}