<?php

namespace Database\Seeders;

use App\Models\Payroll;
use App\Models\Payslip;
use Illuminate\Database\Seeder;

class PayslipSeeder extends Seeder
{
    public function run(): void
    {
        $payrolls = Payroll::all();

        foreach ($payrolls as $payroll) {
            Payslip::create([
                'payroll_id' => $payroll->id,
                'generated_at' => $payroll->pay_date,
                'file_path' => 'payslips/payslip_' . $payroll->id . '.pdf',
            ]);
        }
    }
}