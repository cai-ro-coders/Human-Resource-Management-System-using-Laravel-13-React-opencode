<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with(['department', 'position']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                    ->orWhere('last_name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('employee_id', 'like', "%{$request->search}%");
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = 15;
        $employees = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        $employeeData = $employees->map(function ($emp) {
            return [
                'id' => $emp->id,
                'employee_id' => $emp->employee_id,
                'first_name' => $emp->first_name,
                'last_name' => $emp->last_name,
                'email' => $emp->email,
                'phone' => $emp->phone,
                'gender' => $emp->gender,
                'date_of_birth' => $emp->date_of_birth ? $emp->date_of_birth->format('Y-m-d') : null,
                'address' => $emp->address,
                'hire_date' => $emp->hire_date ? $emp->hire_date->format('Y-m-d') : null,
                'department_id' => $emp->department_id,
                'position_id' => $emp->position_id,
                'status' => $emp->status,
                'profile_photo' => $emp->profile_photo,
                'profile_photo_url' => $emp->profile_photo_url,
                'department' => $emp->department,
                'position' => $emp->position,
            ];
        });

        $departments = Department::all(['id', 'name']);
        $positions = Position::all(['id', 'department_id', 'title']);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'data' => $employees->items(),
                'meta' => [
                    'current_page' => $employees->currentPage(),
                    'last_page' => $employees->lastPage(),
                    'total' => $employees->total(),
                    'per_page' => $perPage,
                ],
            ]);
        }

        return Inertia::render('employees', [
            'employees' => $employeeData,
            'departments' => $departments,
            'positions' => $positions,
            'meta' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'total' => $employees->total(),
                'per_page' => $perPage,
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $request->query('search') ?? '',
            'status' => $request->query('status') ?? 'all',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|unique:employees,employee_id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email',
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'hire_date' => 'required|date',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'status' => 'nullable|in:active,inactive,terminated',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('profile_photo')) {
            $photo = $request->file('profile_photo');
            $filename = time() . '_' . $photo->getClientOriginalName();
            $photo->move(public_path('uploads/profile-photos'), $filename);
            $validated['profile_photo'] = 'uploads/profile-photos/' . $filename;
        }

        $employee = Employee::create($validated);

        return response()->json([
            'message' => 'Employee created successfully',
            'employee' => $employee->load(['department', 'position']),
        ], 201);
    }

    public function show(int $id)
    {
        $employee = Employee::with(['department', 'position'])->findOrFail($id);

        return response()->json($employee);
    }

    public function update(Request $request, int $id)
    {
        $employee = Employee::findOrFail($id);
        
        $isPut = $request->method() === 'PUT' || 
                 ($request->method() === 'POST' && $request->input('_method') === 'PUT');

        $rules = [
            'employee_id' => 'unique:employees,employee_id,' . $id,
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:employees,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'hire_date' => 'required|date',
            'department_id' => 'nullable|exists:departments,id',
            'position_id' => 'nullable|exists:positions,id',
            'status' => 'nullable|in:active,inactive,terminated',
            'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ];

        $validated = $request->validate($rules);

        if ($request->hasFile('profile_photo')) {
            if ($employee->profile_photo && file_exists(public_path($employee->profile_photo))) {
                unlink(public_path($employee->profile_photo));
            }
            $photo = $request->file('profile_photo');
            $filename = time() . '_' . $photo->getClientOriginalName();
            $photo->move(public_path('uploads/profile-photos'), $filename);
            $validated['profile_photo'] = 'uploads/profile-photos/' . $filename;
        }

        $employee->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Employee updated successfully',
                'employee' => $employee->load(['department', 'position']),
            ]);
        }

        return back()->with('success', 'Employee updated successfully');
    }

    public function destroy(int $id)
    {
        $employee = Employee::findOrFail($id);
        
        if ($employee->profile_photo && file_exists(public_path($employee->profile_photo))) {
            unlink(public_path($employee->profile_photo));
        }
        
        $employee->delete();

        return response()->json(['message' => 'Employee deleted successfully']);
    }

    public function getOptions()
    {
        $departments = Department::all(['id', 'name']);
        $positions = Position::with('department:id,name')->get(['id', 'department_id', 'title']);

        return response()->json([
            'departments' => $departments,
            'positions' => $positions,
        ]);
    }
}