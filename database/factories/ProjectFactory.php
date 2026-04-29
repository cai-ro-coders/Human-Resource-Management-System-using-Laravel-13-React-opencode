<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'HR System Upgrade',
                'Employee Portal',
                'Payroll Automation',
                'Attendance System',
                'Leave Management',
                'Performance Review',
                'Recruitment Portal',
                'Training Platform',
            ]),
            'description' => fake()->sentence(),
            'progress' => fake()->numberBetween(0, 100),
            'start_date' => fake()->date('Y-m-d', '-3 months'),
            'end_date' => fake()->date('Y-m-d', '+3 months'),
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
        ];
    }
}