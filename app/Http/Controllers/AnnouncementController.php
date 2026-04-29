<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::with(['user:id,name']);

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('content', 'like', "%{$searchTerm}%");
            });
        }

        $perPage = 15;
        $announcements = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        return Inertia::render('announcements', [
            'announcements' => $announcements->items(),
            'meta' => [
                'current_page' => $announcements->currentPage(),
                'last_page' => $announcements->lastPage(),
                'total' => $announcements->total(),
                'per_page' => $announcements->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['created_by'] = $request->user()->id;

        $announcement = Announcement::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Announcement posted successfully',
                'announcement' => $announcement->load('user'),
            ], 201);
        }

        return back()->with('success', 'Announcement posted successfully');
    }

    public function show(int $id)
    {
        $announcement = Announcement::with('user')->findOrFail($id);

        return response()->json($announcement);
    }

    public function update(Request $request, int $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $announcement->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Announcement updated successfully',
                'announcement' => $announcement->load('user'),
            ]);
        }

        return back()->with('success', 'Announcement updated successfully');
    }

    public function destroy(int $id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully']);
    }
}