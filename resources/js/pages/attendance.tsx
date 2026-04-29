import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Search,
    Pencil,
    Trash2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';

interface Attendance {
    id: number;
    employee_id: number;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: string;
    employee?: {
        id: number;
        employee_id: string;
        first_name: string;
        last_name: string;
    };
}

interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
}

interface Props {
    attendances: Attendance[];
    employees: Employee[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    page: number;
    search?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
}

const ATTENDANCE_URL = '/attendance';

export default function AttendancePage({ 
    attendances: initialAttendances, 
    employees,
    meta, 
    page: currentPage,
    search: initialSearch = '',
    date_from: initialDateFrom = '',
    date_to: initialDateTo = '',
    status: initialStatus = 'all'
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [dateFrom, setDateFrom] = useState(initialDateFrom);
    const [dateTo, setDateTo] = useState(initialDateTo);
    const [status, setStatus] = useState(initialStatus);
    const [attendances] = useState<Attendance[]>(initialAttendances);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
    const [deletingAttendance, setDeletingAttendance] = useState<Attendance | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(ATTENDANCE_URL, { 
            search: search || undefined, 
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            status: status === 'all' ? undefined : status,
            page: 1 
        }, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(ATTENDANCE_URL, { page: newPage }, { replace: true });
    };

    const openModal = (attendance?: Attendance) => {
        if (attendance) {
            setEditingAttendance(attendance);
        } else {
            setEditingAttendance(null);
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAttendance(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const method = editingAttendance ? 'PUT' : 'POST';
            const url = editingAttendance 
                ? `/attendance/${editingAttendance.id}` 
                : '/attendance';

            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ submit: data.message || 'An error occurred' });
                }
                setSaving(false);
                return;
            }

            window.location.reload();
        } catch (error) {
            setErrors({ submit: 'An unexpected error occurred' });
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingAttendance) return;
        setSaving(true);

        try {
            const response = await fetch(`/attendance/${deletingAttendance.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Cannot delete attendance');
                setSaving(false);
                setDeletingAttendance(null);
                return;
            }

            window.location.reload();
        } catch (error) {
            alert('An unexpected error occurred');
            setSaving(false);
            setDeletingAttendance(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'absent':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'late':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'on_leave':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'present': return 'Present';
            case 'absent': return 'Absent';
            case 'late': return 'Late';
            case 'on_leave': return 'On Leave';
            default: return status;
        }
    };

    const formatTime = (time: string | null) => {
        if (!time) return '-';
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            <Head title="Attendance" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            Attendance
                        </h1>
                        <p className="text-sm text-neutral-500">Track employee attendance records</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add Attendance
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex flex-wrap gap-2 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search employee..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 min-w-[150px] rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <input
                        type="date"
                        name="date_from"
                        placeholder="From date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <input
                        type="date"
                        name="date_to"
                        placeholder="To date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    />
                    <select
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <option value="all">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="on_leave">On Leave</option>
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Filter
                    </button>
                </form>

                <div className="flex-1 overflow-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Employee</th>
                                    <th className="px-4 py-3 font-medium">Check In</th>
                                    <th className="px-4 py-3 font-medium">Check Out</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                                            No attendance records found
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.map((att) => (
                                        <tr key={att.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                                    {formatDate(att.date)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {att.employee ? (
                                                    <span>
                                                        {att.employee.first_name} {att.employee.last_name}
                                                        <span className="ml-1 text-xs text-neutral-500">({att.employee.employee_id})</span>
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-neutral-400" />
                                                    {formatTime(att.check_in)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-neutral-400" />
                                                    {formatTime(att.check_out)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1 ${att.status === 'present' ? 'text-green-500' : att.status === 'absent' ? 'text-red-500' : att.status === 'late' ? 'text-yellow-500' : 'text-blue-500'}`}>
                                                    {getStatusIcon(att.status)}
                                                    {getStatusLabel(att.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openModal(att)} 
                                                        className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeletingAttendance(att)} 
                                                        className="rounded p-1 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} records
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {editingAttendance ? 'Edit Attendance' : 'Add Attendance'}
                            </h2>
                            <button onClick={closeModal} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Employee</label>
                                    <select
                                        name="employee_id"
                                        defaultValue={editingAttendance?.employee_id?.toString() || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map((emp) => (
                                            <option key={emp.id} value={emp.id.toString()}>
                                                {emp.first_name} {emp.last_name} ({emp.employee_id})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.employee_id && (
                                        <p className="mt-1 text-sm text-red-500">{errors.employee_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        defaultValue={editingAttendance?.date ? editingAttendance.date.split('T')[0] : ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {errors.date && (
                                        <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Check In</label>
                                    <input
                                        type="time"
                                        name="check_in"
                                        defaultValue={editingAttendance?.check_in ? new Date(editingAttendance.check_in).toTimeString().slice(0, 5) : ''}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {errors.check_in && (
                                        <p className="mt-1 text-sm text-red-500">{errors.check_in}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Check Out</label>
                                    <input
                                        type="time"
                                        name="check_out"
                                        defaultValue={editingAttendance?.check_out ? new Date(editingAttendance.check_out).toTimeString().slice(0, 5) : ''}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {errors.check_out && (
                                        <p className="mt-1 text-sm text-red-500">{errors.check_out}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Status</label>
                                    <select
                                        name="status"
                                        defaultValue={editingAttendance?.status || 'present'}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="present">Present</option>
                                        <option value="absent">Absent</option>
                                        <option value="late">Late</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-500">{errors.status}</p>
                                    )}
                                </div>

                                {errors.submit && (
                                    <p className="text-sm text-red-500">{errors.submit}</p>
                                )}

                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : (editingAttendance ? 'Update' : 'Record')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingAttendance && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold">Delete Attendance</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete this attendance record?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingAttendance(null)}
                                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {saving ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}