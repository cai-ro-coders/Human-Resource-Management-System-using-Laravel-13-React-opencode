<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LeaveFactory extends Factory
{
    protected $model = Leave::class;

    public function definition(): array
    {
        $employee = Employee::inRandomOrder()->first();
        $leaveType = LeaveType::inRandomOrder()->first();
        $startDate = fake()->date('Y-m-d', 'today');
        $days = fake()->numberBetween(1, 5);

        return [
            'employee_id' => $employee?->id,
            'leave_type_id' => $leaveType?->id,
            'start_date' => $startDate,
            'end_date' => date('Y-m-d', strtotime($startDate . ' + ' . $days . ' days')),
            'reason' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'approved_by' => fake()->randomElement([null, User::whereNotNull('role_id')->inRandomOrder()->first()?->id]),
        ];
    }
}