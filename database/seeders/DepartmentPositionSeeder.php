<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

class DepartmentPositionSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Human Resources', 'description' => 'HR department handling recruitment and employee relations'],
            ['name' => 'IT', 'description' => 'Information Technology department'],
            ['name' => 'Finance', 'description' => 'Finance and accounting department'],
            ['name' => 'Marketing', 'description' => 'Marketing and promotions department'],
            ['name' => 'Operations', 'description' => 'Operations and logistics department'],
            ['name' => 'Sales', 'description' => 'Sales and business development'],
            ['name' => 'Customer Support', 'description' => 'Customer service and support'],
            ['name' => 'Research & Development', 'description' => 'R&D and innovation'],
        ];

        $positions = [
            'Human Resources' => ['HR Manager', 'HR Specialist', 'Recruiter', 'HR Coordinator'],
            'IT' => ['Developer', 'QA Engineer', 'DevOps Engineer', 'System Administrator', 'Frontend Developer', 'Backend Developer'],
            'Finance' => ['Financial Analyst', 'Accountant', 'Bookkeeper', 'Finance Manager'],
            'Marketing' => ['Marketing Manager', 'SEO Specialist', 'Content Creator', 'Brand Manager'],
            'Operations' => ['Operations Manager', 'Logistics Coordinator', 'Supply Chain Analyst'],
            'Sales' => ['Sales Manager', 'Sales Representative', 'Account Executive'],
            'Customer Support' => ['Support Manager', 'Customer Service Representative', 'Technical Support Engineer'],
            'Research & Development' => ['R&D Manager', 'Research Scientist', 'Product Developer'],
        ];

        foreach ($departments as $dept) {
            $department = Department::create($dept);
            
            if (isset($positions[$dept['name']])) {
                foreach ($positions[$dept['name']] as $title) {
                    Position::create([
                        'department_id' => $department->id,
                        'title' => $title,
                        'description' => "$title position",
                    ]);
                }
            }
        }
    }
}