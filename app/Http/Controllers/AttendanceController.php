<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('employee:id,first_name,last_name,employee_id');

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->whereHas('employee', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_id', 'like', "%{$searchTerm}%");
            });
        }

        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');
        if ($dateFrom) {
            $query->where('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->where('date', '<=', $dateTo);
        }

        $status = $request->query('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $perPage = 15;
        $attendances = $query->orderBy('date', 'desc')->orderBy('check_in', 'desc')->paginate($perPage)->withQueryString();

        $employees = Employee::select('id', 'employee_id', 'first_name', 'last_name')->orderBy('first_name')->get();

        return Inertia::render('attendance', [
            'attendances' => $attendances->items(),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'last_page' => $attendances->lastPage(),
                'total' => $attendances->total(),
                'per_page' => $attendances->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'date_from' => $dateFrom ?? '',
            'date_to' => $dateTo ?? '',
            'status' => $status ?? 'all',
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->only(['employee_id', 'date', 'status']);
        
        if ($request->check_in) {
            $data['check_in'] = $request->check_in;
        }
        if ($request->check_out) {
            $data['check_out'] = $request->check_out;
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable',
            'check_out' => 'nullable',
            'status' => 'required|in:present,absent,late,on_leave',
        ]);

        $attendance = Attendance::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Attendance recorded successfully',
                'attendance' => $attendance->load('employee'),
            ], 201);
        }

        return back()->with('success', 'Attendance recorded successfully');
    }

    public function show(int $id)
    {
        $attendance = Attendance::with('employee')->findOrFail($id);

        return response()->json($attendance);
    }

    public function update(Request $request, int $id)
    {
        $attendance = Attendance::findOrFail($id);

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'check_in' => 'nullable',
            'check_out' => 'nullable',
            'status' => 'required|in:present,absent,late,on_leave',
        ]);

        $attendance->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Attendance updated successfully',
                'attendance' => $attendance->load('employee'),
            ]);
        }

        return back()->with('success', 'Attendance updated successfully');
    }

    public function destroy(int $id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json(['message' => 'Attendance deleted successfully']);
    }
}