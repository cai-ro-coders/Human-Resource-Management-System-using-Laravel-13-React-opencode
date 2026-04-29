<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    private array $firstNames = [
        'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Carmen', 'Luis', 'Rosa', 'Carlos', 'Sofia',
        'Miguel', 'Isabella', 'Antonio', 'Camila', 'Francisco', 'Lucia', 'Javier', 'Valeria',
        'Ricardo', 'Natalia', 'Fernando', 'Andrea', 'Eduardo', 'Daniela', 'Gabriel', 'Paula',
        'Christian', 'Antonette', 'Michael', 'Jessica', 'Kevin', 'Stephanie', 'Brian', 'Nicole',
        'Matthew', 'Ashley', 'Andrew', 'Samantha', 'Joshua', 'Emily', 'Daniel', 'Jennifer',
        'William', 'Elizabeth', 'David', 'Amanda', 'James', 'Sarah', 'Robert', 'Michelle',
    ];

    private array $lastNames = [
        'Santos', 'Rodriguez', 'Cruz', 'Garcia', 'Martinez', 'Bautista', 'Ramos', 'Valdez',
        'Torres', 'Flores', 'Vargas', 'Mendoza', 'Reyes', 'Morales', 'Gomez', 'Diaz',
        'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Jimenez',
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson',
    ];

    public function run(): void
    {
        $departments = Department::all();
        $positions = Position::all();

        for ($i = 1; $i <= 80; $i++) {
            $firstName = $this->firstNames[array_rand($this->firstNames)];
            $lastName = $this->lastNames[array_rand($this->lastNames)];
            
            $randomPosition = $positions->random();
            $status = $this->getStatus();

            Employee::create([
                'employee_id' => 'EMP' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => strtolower($firstName . '.' . $lastName . $i . '@company.com'),
                'phone' => '+63' . rand(900, 999) . '-' . rand(100, 999) . '-' . rand(1000, 9999),
                'gender' => ['male', 'female', 'other'][array_rand(['male', 'female', 'other'])],
                'date_of_birth' => date('Y-m-d', rand(strtotime('-50 years'), strtotime('-18 years'))),
                'address' => fake()->address(),
                'hire_date' => date('Y-m-d', rand(strtotime('-5 years'), strtotime('-1 month'))),
                'department_id' => $randomPosition->department_id,
                'position_id' => $randomPosition->id,
                'status' => $status,
            ]);
        }
    }

    private function getStatus(): string
    {
        $rand = rand(1, 100);
        if ($rand <= 80) return 'active';
        if ($rand <= 95) return 'inactive';
        return 'terminated';
    }
}