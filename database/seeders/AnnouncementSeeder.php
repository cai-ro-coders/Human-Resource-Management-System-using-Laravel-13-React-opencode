<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        
        $announcements = [
            [
                'user_id' => $user->id,
                'title' => 'Welcome to HR Management System',
                'content' => 'We are excited to announce our new HR Management System. Please take some time to explore the features and let us know your feedback.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'Office Holiday Schedule',
                'content' => 'The office will be closed for the upcoming holidays. Please check the HR portal for the complete holiday schedule.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'New Employee Benefits',
                'content' => 'We have updated our employee benefits package. Check the HR portal for details on health insurance and retirement plans.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'System Maintenance Notice',
                'content' => 'The HR system will undergo maintenance this weekend. Expected downtime: Saturday 10 PM to Sunday 6 AM.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'Town Hall Meeting Reminder',
                'content' => 'Don\'t forget our quarterly town hall meeting next Friday at 3 PM. All employees are encouraged to attend.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'Updated Leave Policy',
                'content' => 'Our leave policy has been updated effective immediately. Please review the new guidelines in the employee handbook.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'Welcome New Team Members',
                'content' => 'Please join us in welcoming our new team members who joined this month. Feel free to introduce yourself!',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'Q1 Performance Review Period',
                'content' => 'Q1 performance reviews will begin next week. Please prepare your self-assessments and schedule meetings with your managers.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'IT Security Update',
                'content' => 'Please update your passwords by end of this month. Follow the new password policy guidelines to ensure account security.',
                'created_by' => $user->id,
            ],
            [
                'user_id' => $user->id,
                'title' => 'Company Anniversary Celebration',
                'content' => 'Join us in celebrating our company anniversary! The celebration party will be held next month. More details to follow.',
                'created_by' => $user->id,
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }
    }
}