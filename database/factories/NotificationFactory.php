<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::whereNotNull('role_id')->inRandomOrder()->first()?->id,
            'title' => fake()->randomElement([
                'Leave Request Approved',
                'Leave Request Rejected',
                'Payroll Generated',
                'New Employee Added',
                'Attendance Report Ready',
                'Performance Review Due',
                'System Update',
            ]),
            'message' => fake()->sentence(),
            'is_read' => fake()->boolean(30),
        ];
    }
}