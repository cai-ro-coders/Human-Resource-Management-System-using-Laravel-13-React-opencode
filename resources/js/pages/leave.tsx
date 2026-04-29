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
    Calendar,
    User,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';

interface Leave {
    id: number;
    employee_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    reason: string | null;
    status: string;
    employee?: {
        id: number;
        employee_id: string;
        first_name: string;
        last_name: string;
    };
    leaveType?: {
        id: number;
        name: string;
    };
}

interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
}

interface LeaveType {
    id: number;
    name: string;
}

interface Props {
    leaves: Leave[];
    employees: Employee[];
    leaveTypes: LeaveType[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    page: number;
    search?: string;
    status?: string;
}

const LEAVE_URL = '/leave';

export default function LeavePage({ 
    leaves: initialLeaves, 
    employees,
    leaveTypes,
    meta, 
    page: currentPage,
    search: initialSearch = '',
    status: initialStatus = 'all'
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    const [leaves] = useState<Leave[]>(initialLeaves);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
    const [deletingLeave, setDeletingLeave] = useState<Leave | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(LEAVE_URL, { 
            search: search || undefined, 
            status: status === 'all' ? undefined : status,
            page: 1 
        }, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(LEAVE_URL, { page: newPage }, { replace: true });
    };

    const openModal = (leave?: Leave) => {
        if (leave) {
            setEditingLeave(leave);
        } else {
            setEditingLeave(null);
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLeave(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const method = editingLeave ? 'PUT' : 'POST';
            const url = editingLeave 
                ? `/leave/${editingLeave.id}` 
                : '/leave';

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
        if (!deletingLeave) return;
        setSaving(true);

        try {
            const response = await fetch(`/leave/${deletingLeave.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Cannot delete leave request');
                setSaving(false);
                setDeletingLeave(null);
                return;
            }

            window.location.reload();
        } catch (error) {
            alert('An unexpected error occurred');
            setSaving(false);
            setDeletingLeave(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'pending': return 'Pending';
            default: return status;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const calculateDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <>
            <Head title="Leave" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            Leave Requests
                        </h1>
                        <p className="text-sm text-neutral-500">Manage employee leave requests</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add Leave
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
                    <select
                        name="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
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
                                    <th className="px-4 py-3 font-medium">Employee</th>
                                    <th className="px-4 py-3 font-medium">Leave Type</th>
                                    <th className="px-4 py-3 font-medium">Start Date</th>
                                    <th className="px-4 py-3 font-medium">End Date</th>
                                    <th className="px-4 py-3 font-medium">Days</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                                            No leave requests found
                                        </td>
                                    </tr>
                                ) : (
                                    leaves.map((leave) => (
                                        <tr key={leave.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="px-4 py-3">
                                                {leave.employee ? (
                                                    <span className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-neutral-400" />
                                                        {leave.employee.first_name} {leave.employee.last_name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-neutral-400" />
                                                    {leave.leaveType?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                                    {formatDate(leave.start_date)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                                    {formatDate(leave.end_date)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">
                                                    {calculateDays(leave.start_date, leave.end_date)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`flex items-center gap-1 ${leave.status === 'approved' ? 'text-green-500' : leave.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                                                    {getStatusIcon(leave.status)}
                                                    {getStatusLabel(leave.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openModal(leave)} 
                                                        className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeletingLeave(leave)} 
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
                                {editingLeave ? 'Edit Leave' : 'Add Leave'}
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
                                        defaultValue={editingLeave?.employee_id?.toString() || ''}
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
                                    <label className="mb-1 block text-sm font-medium">Leave Type</label>
                                    <select
                                        name="leave_type_id"
                                        defaultValue={editingLeave?.leave_type_id?.toString() || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="">Select Leave Type</option>
                                        {leaveTypes.map((lt) => (
                                            <option key={lt.id} value={lt.id.toString()}>
                                                {lt.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.leave_type_id && (
                                        <p className="mt-1 text-sm text-red-500">{errors.leave_type_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        defaultValue={editingLeave?.start_date ? editingLeave.start_date.split('T')[0] : ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {errors.start_date && (
                                        <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        defaultValue={editingLeave?.end_date ? editingLeave.end_date.split('T')[0] : ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {errors.end_date && (
                                        <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Reason</label>
                                    <textarea
                                        name="reason"
                                        defaultValue={editingLeave?.reason || ''}
                                        rows={3}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="Reason for leave..."
                                    />
                                    {errors.reason && (
                                        <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Status</label>
                                    <select
                                        name="status"
                                        defaultValue={editingLeave?.status || 'pending'}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
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
                                        {saving ? 'Saving...' : (editingLeave ? 'Update' : 'Submit')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold">Delete Leave</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete this leave request?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingLeave(null)}
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