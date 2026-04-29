<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'Admin')->first();
        $hrManagerRole = Role::where('name', 'HR Manager')->first();

        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@company.com',
                'password' => Hash::make('password'),
                'role_id' => $adminRole?->id,
            ],
            [
                'name' => 'HR Manager One',
                'email' => 'hr.manager1@company.com',
                'password' => Hash::make('password'),
                'role_id' => $hrManagerRole?->id,
            ],
            [
                'name' => 'HR Manager Two',
                'email' => 'hr.manager2@company.com',
                'password' => Hash::make('password'),
                'role_id' => $hrManagerRole?->id,
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}