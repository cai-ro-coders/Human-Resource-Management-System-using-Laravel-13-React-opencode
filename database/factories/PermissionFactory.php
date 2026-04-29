<?php

namespace Database\Factories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'manage_employees',
                'manage_attendance',
                'manage_leaves',
                'manage_payroll',
                'view_reports',
            ]),
        ];
    }
}