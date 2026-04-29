<?php

namespace Database\Factories;

use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaveTypeFactory extends Factory
{
    protected $model = LeaveType::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'Sick Leave',
                'Vacation Leave',
                'Emergency Leave',
                'Maternity Leave',
                'Paternity Leave',
                'Personal Leave',
            ]),
            'days_allowed' => fake()->randomElement([5, 10, 15, 12, 7]),
        ];
    }
}