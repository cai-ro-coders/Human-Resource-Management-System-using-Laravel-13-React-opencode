<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Payroll;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        $query = Payroll::with('employee:id,first_name,last_name,employee_id');

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->whereHas('employee', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_id', 'like', "%{$searchTerm}%");
            });
        }

        $month = $request->query('month');
        if ($month) {
            $query->whereRaw('DATE_FORMAT(pay_date, "%Y-%m") = ?', [$month]);
        }

        $perPage = 15;
        $payrolls = $query->orderBy('pay_date', 'desc')->paginate($perPage)->withQueryString();

        $employees = Employee::select('id', 'employee_id', 'first_name', 'last_name')->orderBy('first_name')->get();

        return Inertia::render('payroll', [
            'payrolls' => $payrolls->items(),
            'meta' => [
                'current_page' => $payrolls->currentPage(),
                'last_page' => $payrolls->lastPage(),
                'total' => $payrolls->total(),
                'per_page' => $payrolls->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'month' => $month ?? '',
            'employees' => $employees,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'basic_salary' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'pay_date' => 'required|date',
        ]);

        $validated['net_salary'] = ($validated['basic_salary'] + ($validated['bonus'] ?? 0)) - ($validated['deductions'] ?? 0);

        $payroll = Payroll::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Payroll recorded successfully',
                'payroll' => $payroll->load('employee'),
            ], 201);
        }

        return back()->with('success', 'Payroll recorded successfully');
    }

    public function show(int $id)
    {
        $payroll = Payroll::with('employee')->findOrFail($id);

        return response()->json($payroll);
    }

    public function update(Request $request, int $id)
    {
        $payroll = Payroll::findOrFail($id);

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'basic_salary' => 'required|numeric|min:0',
            'bonus' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'pay_date' => 'required|date',
        ]);

        $validated['net_salary'] = ($validated['basic_salary'] + ($validated['bonus'] ?? 0)) - ($validated['deductions'] ?? 0);

        $payroll->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Payroll updated successfully',
                'payroll' => $payroll->load('employee'),
            ]);
        }

        return back()->with('success', 'Payroll updated successfully');
    }

    public function destroy(int $id)
    {
        $payroll = Payroll::findOrFail($id);
        $payroll->delete();

        return response()->json(['message' => 'Payroll deleted successfully']);
    }
}