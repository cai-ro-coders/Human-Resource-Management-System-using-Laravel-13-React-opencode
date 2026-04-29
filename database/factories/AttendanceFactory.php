<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        $employee = Employee::inRandomOrder()->first();
        
        return [
            'employee_id' => $employee?->id,
            'date' => fake()->date('Y-m-d', 'today'),
            'check_in' => fake()->time('H:i:s', '08:00:00'),
            'check_out' => fake()->time('H:i:s', '17:00:00'),
            'status' => fake()->randomElement(['present', 'present', 'present', 'late', 'absent']),
        ];
    }
}