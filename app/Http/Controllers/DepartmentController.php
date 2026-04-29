<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::withCount('employees', 'positions');

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        $perPage = 15;
        $departments = $query->orderBy('name')->paginate($perPage)->withQueryString();

        $positions = Position::with('department:id,name')->get(['id', 'department_id', 'title']);

        return Inertia::render('departments', [
            'departments' => $departments->items(),
            'meta' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'total' => $departments->total(),
                'per_page' => $departments->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'positions' => $positions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
        ]);

        $department = Department::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Department created successfully',
                'department' => $department,
            ], 201);
        }

        return back()->with('success', 'Department created successfully');
    }

    public function show(int $id)
    {
        $department = Department::with(['positions', 'employees'])->findOrFail($id);

        return response()->json($department);
    }

    public function update(Request $request, int $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $department->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Department updated successfully',
                'department' => $department,
            ]);
        }

        return back()->with('success', 'Department updated successfully');
    }

    public function destroy(int $id)
    {
        $department = Department::findOrFail($id);

        if ($department->employees()->count() > 0) {
            return response()->json(['message' => 'Cannot delete department with employees'], 422);
        }

        $department->delete();

        return response()->json(['message' => 'Department deleted successfully']);
    }
}