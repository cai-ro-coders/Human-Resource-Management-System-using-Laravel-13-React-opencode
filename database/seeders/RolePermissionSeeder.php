<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Admin'],
            ['name' => 'HR Manager'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        $permissions = [
            ['name' => 'manage_employees'],
            ['name' => 'manage_attendance'],
            ['name' => 'manage_leaves'],
            ['name' => 'manage_payroll'],
            ['name' => 'view_reports'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        $adminRole = Role::where('name', 'Admin')->first();
        $hrManagerRole = Role::where('name', 'HR Manager')->first();
        $allPermissions = Permission::all();
        $limitedPermissions = Permission::whereIn('name', ['manage_employees', 'manage_attendance', 'manage_leaves'])->get();

        $adminRole->permissions()->attach($allPermissions->pluck('id')->toArray());
        $hrManagerRole->permissions()->attach($limitedPermissions->pluck('id')->toArray());
    }
}