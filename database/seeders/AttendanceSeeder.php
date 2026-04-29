<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::where('status', 'active')->get();
        $today = Carbon::now();
        
        foreach ($employees as $employee) {
            for ($days = 0; $days < 30; $days++) {
                $date = $today->copy()->subDays($days);
                
                if ($date->dayOfWeek === Carbon::SUNDAY || $date->dayOfWeek === Carbon::SATURDAY) {
                    continue;
                }

                $rand = rand(1, 100);
                if ($rand <= 15) {
                    Attendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->toDateString(),
                        'check_in' => null,
                        'check_out' => null,
                        'status' => 'absent',
                    ]);
                } elseif ($rand <= 25) {
                    $checkIn = Carbon::createFromTimeString('08:31:00')->addMinutes(rand(0, 30));
                    $checkOut = Carbon::createFromTimeString('17:00:00')->addHours(rand(0, 2));
                    
                    Attendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->toDateString(),
                        'check_in' => $checkIn->toTimeString(),
                        'check_out' => $checkOut->toTimeString(),
                        'status' => 'late',
                    ]);
                } else {
                    $checkIn = Carbon::createFromTimeString('08:00:00')->addMinutes(rand(0, 30));
                    $checkOut = Carbon::createFromTimeString('17:00:00')->addHours(rand(0, 2));
                    
                    Attendance::create([
                        'employee_id' => $employee->id,
                        'date' => $date->toDateString(),
                        'check_in' => $checkIn->toTimeString(),
                        'check_out' => $checkOut->toTimeString(),
                        'status' => 'present',
                    ]);
                }
            }
        }
    }
}