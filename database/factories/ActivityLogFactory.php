<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ActivityLogFactory extends Factory
{
    protected $model = ActivityLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::whereNotNull('role_id')->inRandomOrder()->first()?->id,
            'action' => fake()->randomElement([
                'Created employee',
                'Updated employee',
                'Approved leave',
                'Rejected leave',
                'Generated payroll',
                'Updated attendance',
                'Created department',
                'Updated position',
                'Logged in',
                'Logged out',
            ]),
            'description' => fake()->sentence(),
            'ip_address' => fake()->ipv4(),
            'created_at' => fake()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}