<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Eloquent\Factories\Factory;

class PositionFactory extends Factory
{
    protected $model = Position::class;

    private array $positionTitles = [
        'Human Resources' => ['HR Manager', 'HR Specialist', 'Recruiter', 'HR Coordinator'],
        'IT' => ['Developer', 'QA Engineer', 'DevOps Engineer', 'System Administrator', 'Frontend Developer', 'Backend Developer'],
        'Finance' => ['Financial Analyst', 'Accountant', 'Bookkeeper', 'Finance Manager'],
        'Marketing' => ['Marketing Manager', 'SEO Specialist', 'Content Creator', 'Brand Manager'],
        'Operations' => ['Operations Manager', 'Logistics Coordinator', 'Supply Chain Analyst'],
        'Sales' => ['Sales Manager', 'Sales Representative', 'Account Executive'],
        'Customer Support' => ['Support Manager', 'Customer Service Representative', 'Technical Support Engineer'],
        'Research & Development' => ['R&D Manager', 'Research Scientist', 'Product Developer'],
    ];

    public function definition(): array
    {
        $department = Department::inRandomOrder()->first() ?? Department::factory();
        $titles = $this->positionTitles[$department->name] ?? ['Staff', 'Associate'];

        return [
            'department_id' => $department->id,
            'title' => fake()->randomElement($titles),
            'description' => fake()->sentence(),
        ];
    }
}