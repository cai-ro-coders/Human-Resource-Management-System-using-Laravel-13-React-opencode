<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalEmployees = Employee::count();
        $activeEmployees = Employee::where('status', 'active')->count();
        $inactiveEmployees = Employee::where('status', 'inactive')->count();
        $terminatedEmployees = Employee::where('status', 'terminated')->count();
        
        $employeesOnLeave = Leave::where('status', 'approved')
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->count();
        
        $pendingLeaveApprovals = Leave::where('status', 'pending')->count();
        
        $departmentCount = Department::count();
        
        $recentProjects = Project::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'project_start_date', 'status'])
            ->map(function ($project) {
                $startDate = $project->project_start_date;
                return [
                    'id' => $project->id,
                    'name' => $project->title,
                    'start_date' => $startDate ? $startDate->toDateString() : null,
                    'progress' => match ($project->status) {
                        'pending' => 10,
                        'in_progress' => 45,
                        'completed' => 100,
                        'on_hold' => 30,
                        default => 0,
                    },
                    'status' => $project->status,
                ];
            });
        
        $employeeStatusData = [
            'active' => $activeEmployees,
            'inactive' => $inactiveEmployees,
            'terminated' => $terminatedEmployees,
        ];
        
        $departmentEmployeeCount = Department::withCount('employees')
            ->get()
            ->pluck('employees_count', 'name');
        
        $todayAttendance = Attendance::whereDate('date', today())
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');
        
        $monthlyAttendance = Attendance::whereBetween('date', [now()->startOfMonth(), now()->endOfMonth()])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');
        
        return response()->json([
            'total_employees' => $totalEmployees,
            'employees_on_leave' => $employeesOnLeave,
            'department_count' => $departmentCount,
            'pending_leave_approvals' => $pendingLeaveApprovals,
            'recent_projects' => $recentProjects,
            'employee_status_data' => $employeeStatusData,
            'department_employee_count' => $departmentEmployeeCount,
            'today_attendance' => [
                'present' => $todayAttendance['present'] ?? 0,
                'late' => $todayAttendance['late'] ?? 0,
                'absent' => $todayAttendance['absent'] ?? 0,
            ],
            'monthly_attendance' => [
                'present' => $monthlyAttendance['present'] ?? 0,
                'late' => $monthlyAttendance['late'] ?? 0,
                'absent' => $monthlyAttendance['absent'] ?? 0,
            ],
        ]);
    }
}