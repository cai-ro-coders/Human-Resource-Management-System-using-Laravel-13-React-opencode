<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        $titles = [
            'Company Town Hall Meeting',
            'New Leave Policy Update',
            'Office Renovation Notice',
            'Q1 Performance Reviews',
            'Health Insurance Changes',
            'Holiday Schedule 2026',
            'IT System Maintenance',
            'New Employee Orientation',
            'Annual Party Announcement',
            'Policy Change: Remote Work',
        ];

        $contents = [
            'We are pleased to announce that our quarterly town hall meeting will be held next week. All employees are encouraged to attend and share their feedback.',
            'Effective immediately, our leave policy has been updated. Please review the new guidelines in the employee handbook.',
            'The office renovation will begin next month. Temporary workspaces have been arranged on the 3rd floor.',
            'Performance reviews for Q1 will be conducted throughout the month. Please schedule meetings with your managers.',
            'We have partnered with a new health insurance provider. Open enrollment begins next week.',
            'The holiday schedule for 2026 has been finalized. Please note the additional holidays.',
            'Scheduled IT maintenance will occur this weekend. Please save your work before Friday.',
            'Welcome to our new team members! Orientation sessions will be held on Mondays.',
            'Our annual company party will be held next month. More details to follow.',
            'Our remote work policy has been updated. Please review the new flexible work arrangements.',
        ];

        return [
            'user_id' => User::factory(),
            'title' => $titles[array_rand($titles)],
            'content' => $contents[array_rand($contents)],
            'created_by' => User::first()?->id ?? 1,
        ];
    }
}