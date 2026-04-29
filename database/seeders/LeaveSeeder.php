<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LeaveSeeder extends Seeder
{
    private array $reasons = [
        'Family emergency',
        'Medical appointment',
        'Vacation trip',
        'Personal matters',
        'Sick leave',
        'Family vacation',
        'Home repair',
        'Moving to new house',
        'Wedding ceremony',
        'Death in family',
    ];

    public function run(): void
    {
        $employees = Employee::where('status', 'active')->get();
        $leaveTypes = LeaveType::all();
        $admins = User::whereNotNull('role_id')->get();

        $employeeCount = $employees->count();
        $leavesToCreate = (int) ($employeeCount * 0.3);

        for ($i = 0; $i < $leavesToCreate; $i++) {
            $employee = $employees->random();
            $leaveType = $leaveTypes->random();
            $startDate = Carbon::now()->subDays(rand(1, 60));
            $endDate = $startDate->copy()->addDays(rand(1, min($leaveType->days_allowed, 5)));
            
            $status = ['pending', 'approved', 'rejected'][array_rand(['pending', 'approved', 'rejected'])];
            $approvedBy = $status !== 'pending' ? $admins->random()?->id : null;

            Leave::create([
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'reason' => $this->reasons[array_rand($this->reasons)],
                'status' => $status,
                'approved_by' => $approvedBy,
            ]);
        }
    }
}