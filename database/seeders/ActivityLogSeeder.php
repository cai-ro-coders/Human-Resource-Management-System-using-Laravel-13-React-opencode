<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    private array $actions = [
        'Created employee',
        'Updated employee',
        'Approved leave',
        'Rejected leave',
        'Generated payroll',
        'Updated attendance',
        'Created department',
        'Updated position',
        'Logged in',
        'Logged out',
        'Created user account',
        'Updated user permissions',
    ];

    private array $descriptions = [
        'New employee record was created',
        'Employee information was updated',
        'Leave request was approved by HR',
        'Leave request was rejected',
        'Monthly payroll was generated for all employees',
        'Attendance record was updated',
        'New department was created',
        'Position details were updated',
        'User logged into the system',
        'User logged out of the system',
    ];

    public function run(): void
    {
        $admins = User::whereNotNull('role_id')->get();

        for ($i = 0; $i < 100; $i++) {
            $admin = $admins->random();
            
            ActivityLog::create([
                'user_id' => $admin->id,
                'action' => $this->actions[array_rand($this->actions)],
                'description' => $this->descriptions[array_rand($this->descriptions)],
                'ip_address' => rand(1, 255) . '.' . rand(0, 255) . '.' . rand(0, 255) . '.' . rand(1, 255),
                'created_at' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }
    }
}