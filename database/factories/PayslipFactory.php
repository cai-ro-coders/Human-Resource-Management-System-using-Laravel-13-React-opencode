<?php

namespace Database\Factories;

use App\Models\Payroll;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayslipFactory extends Factory
{
    protected $model = \App\Models\Payslip::class;

    public function definition(): array
    {
        return [
            'payroll_id' => Payroll::inRandomOrder()->first()?->id,
            'generated_at' => now(),
            'file_path' => 'payslips/payslip_' . fake()->uuid() . '.pdf',
        ];
    }
}