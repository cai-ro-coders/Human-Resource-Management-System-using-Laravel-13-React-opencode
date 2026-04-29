<?php

namespace Database\Seeders;

use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $leaveTypes = [
            ['name' => 'Sick Leave', 'days_allowed' => 10],
            ['name' => 'Vacation Leave', 'days_allowed' => 15],
            ['name' => 'Emergency Leave', 'days_allowed' => 5],
            ['name' => 'Maternity Leave', 'days_allowed' => 60],
            ['name' => 'Paternity Leave', 'days_allowed' => 7],
        ];

        foreach ($leaveTypes as $type) {
            LeaveType::create($type);
        }
    }
}