import { Head } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import {
    Users,
    Building2,
    Clock,
    AlertCircle,
    CheckCircle2,
    FolderKanban,
    TrendingUp,
    Calendar,
    Activity,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { dashboard } from '@/routes';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface DashboardStats {
    total_employees: number;
    employees_on_leave: number;
    department_count: number;
    pending_leave_approvals: number;
    recent_projects: Array<{
        id: number;
        name: string;
        progress: number;
        start_date: string;
        status: string;
    }>;
    employee_status_data: {
        active: number;
        inactive: number;
        terminated: number;
    };
    department_employee_count: Record<string, number>;
    today_attendance: {
        present: number;
        late: number;
        absent: number;
    };
    monthly_attendance: {
        present: number;
        late: number;
        absent: number;
    };
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then((res) => res.json())
            .then((data) => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    if (loading || !stats) {
        return (
            <>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 items-center justify-center">
                    <div className="text-neutral-500">Loading...</div>
                </div>
            </>
        );
    }

    const employeeStatusChart = {
        labels: ['Active', 'Inactive', 'Terminated'],
        datasets: [
            {
                data: [
                    stats.employee_status_data.active,
                    stats.employee_status_data.inactive,
                    stats.employee_status_data.terminated,
                ],
                backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    const departmentChart = {
        labels: Object.keys(stats.department_employee_count),
        datasets: [
            {
                label: 'Employees',
                data: Object.values(stats.department_employee_count),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            },
        ],
    };

    const attendanceChart = {
        labels: ['Present', 'Late', 'Absent'],
        datasets: [
            {
                data: [
                    stats.today_attendance.present,
                    stats.today_attendance.late,
                    stats.today_attendance.absent,
                ],
                backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
                borderWidth: 0,
            },
        ],
    };

    const statCards = [
        {
            label: 'Total Employees',
            value: stats.total_employees,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            label: 'Employees on Leave',
            value: stats.employees_on_leave,
            icon: Clock,
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10',
        },
        {
            label: 'Departments',
            value: stats.department_count,
            icon: Building2,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
        },
        {
            label: 'Pending Approvals',
            value: stats.pending_leave_approvals,
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-600';
            case 'in_progress':
                return 'bg-blue-500/10 text-blue-600';
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-600';
            default:
                return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card, index) => (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-500">
                                        {card.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-semibold">
                                        {card.value}
                                    </p>
                                </div>
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}
                                >
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold">
                            Employee Status
                        </h3>
                        <div className="flex justify-center">
                            <div className="w-48">
                                <Doughnut data={employeeStatusChart} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold">
                            Employees by Department
                        </h3>
                        <Bar
                            data={departmentChart}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        display: false,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-semibold">
                            Today&apos;s Attendance
                        </h3>
                        <div className="flex justify-center">
                            <div className="w-48">
                                <Doughnut data={attendanceChart} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Recent Projects</h3>
                        <FolderKanban className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                                    <th className="pb-3 font-medium">Project Name</th>
                                    <th className="pb-3 font-medium">Progress</th>
                                    <th className="pb-3 font-medium">Start Date</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_projects.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                                    >
                                        <td className="py-3">{project.name}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-neutral-200">
                                                    <div
                                                        className="h-full rounded-full bg-blue-500"
                                                        style={{
                                                            width: `${project.progress}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs">
                                                    {project.progress}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {new Date(
                                                project.start_date
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="py-3">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status.replace(
                                                    '_',
                                                    ' '
                                                )}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};