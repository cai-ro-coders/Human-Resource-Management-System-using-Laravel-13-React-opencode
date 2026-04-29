<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        $query = Position::with('department:id,name');

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        $perPage = 15;
        $positions = $query->orderBy('title')->paginate($perPage)->withQueryString();

        $departments = Department::all(['id', 'name']);

        return Inertia::render('positions', [
            'positions' => $positions->items(),
            'meta' => [
                'current_page' => $positions->currentPage(),
                'last_page' => $positions->lastPage(),
                'total' => $positions->total(),
                'per_page' => $positions->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'description' => 'nullable|string',
        ]);

        $position = Position::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Position created successfully',
                'position' => $position->load('department'),
            ], 201);
        }

        return back()->with('success', 'Position created successfully');
    }

    public function show(int $id)
    {
        $position = Position::with('department')->findOrFail($id);

        return response()->json($position);
    }

    public function update(Request $request, int $id)
    {
        $position = Position::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'description' => 'nullable|string',
        ]);

        $position->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Position updated successfully',
                'position' => $position->load('department'),
            ]);
        }

        return back()->with('success', 'Position updated successfully');
    }

    public function destroy(int $id)
    {
        $position = Position::findOrFail($id);

        if ($position->employees()->count() > 0) {
            return response()->json(['message' => 'Cannot delete position with employees'], 422);
        }

        $position->delete();

        return response()->json(['message' => 'Position deleted successfully']);
    }
}