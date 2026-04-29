<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        
        $projects = [
            [
                'user_id' => $user?->id,
                'title' => 'HR System Upgrade',
                'client' => 'Internal',
                'details' => 'Upgrade the existing HR management system with new features and better performance.',
                'project_start_date' => '2025-01-15',
                'project_end_date' => '2025-06-30',
                'status' => 'in_progress',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Employee Portal',
                'client' => 'Internal',
                'details' => 'New employee self-service portal for leave requests and profile updates.',
                'project_start_date' => '2024-10-01',
                'project_end_date' => '2025-03-15',
                'status' => 'completed',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Payroll Automation',
                'client' => 'Finance Department',
                'details' => 'Automate monthly payroll processing and generate payslips automatically.',
                'project_start_date' => '2025-02-01',
                'project_end_date' => '2025-08-30',
                'status' => 'in_progress',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Attendance System',
                'client' => 'Internal',
                'details' => 'Biometric attendance integration for employee time tracking.',
                'project_start_date' => '2024-08-01',
                'project_end_date' => '2024-12-31',
                'status' => 'completed',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Leave Management',
                'client' => 'HR Department',
                'details' => 'Digital leave request and approval workflow with calendar integration.',
                'project_start_date' => '2025-01-01',
                'project_end_date' => '2025-04-30',
                'status' => 'in_progress',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Performance Review System',
                'client' => 'HR Department',
                'details' => 'Annual performance review system with goal tracking.',
                'project_start_date' => '2025-03-01',
                'project_end_date' => '2025-06-30',
                'status' => 'in_progress',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Recruitment Portal',
                'client' => 'HR Department',
                'details' => 'Online recruitment and application portal with applicant tracking.',
                'project_start_date' => '2024-06-01',
                'project_end_date' => '2024-11-30',
                'status' => 'completed',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Training Platform',
                'client' => 'Learning & Development',
                'details' => 'Employee training and certification platform with progress tracking.',
                'project_start_date' => '2025-04-01',
                'project_end_date' => '2025-12-31',
                'status' => 'pending',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Mobile App Development',
                'client' => 'Internal',
                'details' => 'HR mobile application for employees on the go.',
                'project_start_date' => '2025-05-01',
                'project_end_date' => '2025-10-31',
                'status' => 'pending',
            ],
            [
                'user_id' => $user?->id,
                'title' => 'Data Analytics Dashboard',
                'client' => 'Management',
                'details' => 'HR analytics dashboard for workforce insights and reporting.',
                'project_start_date' => '2025-06-01',
                'project_end_date' => '2025-12-31',
                'status' => 'pending',
            ],
        ];

        foreach ($projects as $project) {
            Project::create($project);
        }
    }
}