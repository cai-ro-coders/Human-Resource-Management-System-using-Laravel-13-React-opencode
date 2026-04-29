<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayrollFactory extends Factory
{
    protected $model = Payroll::class;

    private array $salaryRanges = [
        'Developer' => [25000, 80000],
        'QA Engineer' => [20000, 50000],
        'DevOps Engineer' => [30000, 70000],
        'System Administrator' => [25000, 55000],
        'Frontend Developer' => [25000, 60000],
        'Backend Developer' => [30000, 75000],
        'HR Manager' => [40000, 80000],
        'HR Specialist' => [20000, 40000],
        'Recruiter' => [18000, 35000],
        'HR Coordinator' => [15000, 30000],
        'Financial Analyst' => [25000, 55000],
        'Accountant' => [20000, 45000],
        'Bookkeeper' => [15000, 30000],
        'Finance Manager' => [40000, 75000],
        'Marketing Manager' => [35000, 70000],
        'SEO Specialist' => [20000, 45000],
        'Content Creator' => [18000, 40000],
        'Brand Manager' => [25000, 50000],
        'Operations Manager' => [35000, 70000],
        'Logistics Coordinator' => [20000, 45000],
        'Supply Chain Analyst' => [22000, 48000],
        'Sales Manager' => [30000, 65000],
        'Sales Representative' => [18000, 40000],
        'Account Executive' => [22000, 50000],
        'Support Manager' => [30000, 60000],
        'Customer Service Representative' => [15000, 28000],
        'Technical Support Engineer' => [22000, 48000],
        'R&D Manager' => [40000, 85000],
        'Research Scientist' => [30000, 65000],
        'Product Developer' => [28000, 60000],
        'Staff' => [15000, 25000],
        'Associate' => [15000, 25000],
    ];

    public function definition(): array
    {
        $employee = Employee::inRandomOrder()->first();
        $position = $employee?->position;
        $title = $position?->title ?? 'Staff';
        $range = $this->salaryRanges[$title] ?? [15000, 30000];
        
        $basicSalary = fake()->randomFloat(2, $range[0], $range[1]);
        $bonus = fake()->randomFloat(2, 0, 10000);
        $deductions = fake()->randomFloat(2, 0, 5000);
        $netSalary = $basicSalary + $bonus - $deductions;

        return [
            'employee_id' => $employee?->id,
            'basic_salary' => round($basicSalary, 2),
            'bonus' => round($bonus, 2),
            'deductions' => round($deductions, 2),
            'net_salary' => round($netSalary, 2),
            'pay_date' => fake()->date('Y-m-01'),
        ];
    }
}