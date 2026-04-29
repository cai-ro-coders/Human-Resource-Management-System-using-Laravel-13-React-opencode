<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\Payslip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayslipController extends Controller
{
    public function index(Request $request)
    {
        $query = Payslip::with(['payroll.employee:id,first_name,last_name,employee_id']);

        $searchTerm = $request->query('search');
        if ($searchTerm) {
            $query->whereHas('payroll.employee', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                  ->orWhere('last_name', 'like', "%{$searchTerm}%")
                  ->orWhere('employee_id', 'like', "%{$searchTerm}%");
            });
        }

        $month = $request->query('month');
        if ($month) {
            $query->whereHas('payroll', function ($q) use ($month) {
                $q->whereRaw('DATE_FORMAT(pay_date, "%Y-%m") = ?', [$month]);
            });
        }

        $perPage = 15;
        $payslips = $query->orderBy('generated_at', 'desc')->paginate($perPage)->withQueryString();

        $payrolls = Payroll::with('employee:id,first_name,last_name,employee_id')
            ->orderBy('pay_date', 'desc')
            ->get();

        return Inertia::render('payslip', [
            'payslips' => $payslips->items(),
            'meta' => [
                'current_page' => $payslips->currentPage(),
                'last_page' => $payslips->lastPage(),
                'total' => $payslips->total(),
                'per_page' => $payslips->perPage(),
            ],
            'page' => (int) ($request->query('page') ?? 1),
            'search' => $searchTerm ?? '',
            'month' => $month ?? '',
            'payrolls' => $payrolls,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'payroll_id' => 'required|exists:payrolls,id',
        ]);

        $payroll = Payroll::with('employee')->findOrFail($validated['payroll_id']);

        $employee = $payroll->employee;
        $filename = 'payslip_' . $employee->employee_id . '_' . date('Y-m') . '.pdf';
        $filePath = 'uploads/payslips/' . $filename;

        $validated['generated_at'] = now();
        $validated['file_path'] = $filePath;

        $payslip = Payslip::create($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Payslip generated successfully',
                'payslip' => $payslip->load(['payroll.employee']),
            ], 201);
        }

        return back()->with('success', 'Payslip generated successfully');
    }

    public function show(int $id)
    {
        $payslip = Payslip::with(['payroll.employee'])->findOrFail($id);

        return response()->json($payslip);
    }

    public function update(Request $request, int $id)
    {
        $payslip = Payslip::findOrFail($id);

        $validated = $request->validate([
            'payroll_id' => 'required|exists:payrolls,id',
        ]);

        $payslip->update($validated);

        if ($request->expectsJson() || str_starts_with($request->header('Accept') ?? '', 'application/json')) {
            return response()->json([
                'message' => 'Payslip updated successfully',
                'payslip' => $payslip->load(['payroll.employee']),
            ]);
        }

        return back()->with('success', 'Payslip updated successfully');
    }

    public function destroy(int $id)
    {
        $payslip = Payslip::findOrFail($id);
        
        if ($payslip->file_path && file_exists(public_path($payslip->file_path))) {
            unlink(public_path($payslip->file_path));
        }
        
        $payslip->delete();

        return response()->json(['message' => 'Payslip deleted successfully']);
    }
}