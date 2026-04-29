<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            DepartmentPositionSeeder::class,
            EmployeeSeeder::class,
            AttendanceSeeder::class,
            LeaveTypeSeeder::class,
            LeaveSeeder::class,
            PayrollSeeder::class,
            PayslipSeeder::class,
            ProjectSeeder::class,
            NotificationSeeder::class,
            ActivityLogSeeder::class,
            AnnouncementSeeder::class,
        ]);
    }
}