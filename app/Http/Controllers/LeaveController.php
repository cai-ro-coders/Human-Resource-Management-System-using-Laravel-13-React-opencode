<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Leave;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = Leave::with(['employee:id,first_name,last_name,employee_id', 'leaveType:id,name']);

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->whereHas('employee', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_id', 'like', "%{$searchTerm}%");
            });
        }

        $status = $request->query('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $perPage = 15;
        $leaves = $query->orderBy('start_date', 'desc')->paginate($perPage)->withQueryString();

        $employees = Employee::select('id', 'employee_id', 'first_name', 'last_name')->orderBy('first_name')->get();
        $leaveTypes = LeaveType::all(['id', 'name']);

        return Inertia::render('leave', [
            'leaves' => $leaves->items(),
            'meta' => [
                'current_page' => $leaves->currentPage(),
                'last_page' => $leaves->lastPage(),
                'total' => $leaves->total(),
                'per_page' => $leaves->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'status' => $status ?? 'all',
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $validated['status'] = $validated['status'] ?? 'pending';

        $leave = Leave::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Leave request recorded successfully',
                'leave' => $leave->load(['employee', 'leaveType']),
            ], 201);
        }

        return back()->with('success', 'Leave request recorded successfully');
    }

    public function show(int $id)
    {
        $leave = Leave::with(['employee', 'leaveType'])->findOrFail($id);

        return response()->json($leave);
    }

    public function update(Request $request, int $id)
    {
        $leave = Leave::findOrFail($id);

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'leave_type_id' => 'required|exists:leave_types,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string',
            'status' => 'nullable|in:pending,approved,rejected',
        ]);

        $leave->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Leave request updated successfully',
                'leave' => $leave->load(['employee', 'leaveType']),
            ]);
        }

        return back()->with('success', 'Leave request updated successfully');
    }

    public function destroy(int $id)
    {
        $leave = Leave::findOrFail($id);
        $leave->delete();

        return response()->json(['message' => 'Leave request deleted successfully']);
    }
}