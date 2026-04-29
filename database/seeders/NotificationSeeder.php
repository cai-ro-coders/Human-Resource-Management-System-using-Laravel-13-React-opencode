<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    private array $titles = [
        'Leave Request Approved',
        'Leave Request Rejected',
        'Payroll Generated',
        'New Employee Added',
        'Attendance Report Ready',
        'Performance Review Due',
        'System Update Required',
        'Profile Updated',
    ];

    private array $messages = [
        'Your leave request has been approved by the HR manager.',
        'Your leave request was rejected. Please contact HR for more information.',
        'Payroll for this month has been generated.',
        'A new employee has been added to the system.',
        'Attendance report is now ready for review.',
        'Performance review is due this month.',
        'Please update your profile information.',
        'System maintenance is scheduled for this weekend.',
    ];

    public function run(): void
    {
        $admins = User::whereNotNull('role_id')->get();

        for ($i = 0; $i < 50; $i++) {
            $admin = $admins->random();
            
            Notification::create([
                'user_id' => $admin->id,
                'title' => $this->titles[array_rand($this->titles)],
                'message' => $this->messages[array_rand($this->messages)],
                'is_read' => rand(0, 10) > 3,
            ]);
        }
    }
}