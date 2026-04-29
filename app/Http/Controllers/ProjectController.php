<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Project::with('user:id,name');

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('client', 'like', "%{$searchTerm}%")
                  ->orWhere('details', 'like', "%{$searchTerm}%");
            });
        }

        $status = $request->query('status');
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $perPage = 15;
        $projects = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        return Inertia::render('projects', [
            'projects' => $projects->items(),
            'meta' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'total' => $projects->total(),
                'per_page' => $projects->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'status' => $status ?? 'all',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client' => 'nullable|string|max:255',
            'details' => 'nullable|string',
            'project_start_date' => 'nullable|date',
            'project_end_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
        ]);

        $validated['status'] = $validated['status'] ?? 'pending';

        $project = Project::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Project created successfully',
                'project' => $project->load('user'),
            ], 201);
        }

        return back()->with('success', 'Project created successfully');
    }

    public function show(int $id)
    {
        $project = Project::with('user')->findOrFail($id);

        return response()->json($project);
    }

    public function update(Request $request, int $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'client' => 'nullable|string|max:255',
            'details' => 'nullable|string',
            'project_start_date' => 'nullable|date',
            'project_end_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
        ]);

        $project->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Project updated successfully',
                'project' => $project->load('user'),
            ]);
        }

        return back()->with('success', 'Project updated successfully');
    }

    public function destroy(int $id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }
}