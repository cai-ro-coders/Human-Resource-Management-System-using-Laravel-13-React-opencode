<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

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

    private int $employeeCount = 0;

    public function definition(): array
    {
        $this->employeeCount++;
        
        $firstName = $this->firstNames[array_rand($this->firstNames)];
        $lastName = $this->lastNames[array_rand($this->lastNames)];

        return [
            'employee_id' => 'EMP' . str_pad($this->employeeCount, 4, '0', STR_PAD_LEFT),
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => strtolower($firstName . '.' . $lastName . $this->employeeCount . '@company.com'),
            'phone' => '+63' . fake()->numerify('###-###-####'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'date_of_birth' => fake()->date('Y-m-d', '-18 years'),
            'address' => fake()->address(),
            'hire_date' => fake()->date('Y-m-d', '-5 years'),
            'department_id' => null,
            'position_id' => null,
            'status' => fake()->randomElement(['active', 'active', 'active', 'active', 'inactive', 'terminated']),
        ];
    }
}