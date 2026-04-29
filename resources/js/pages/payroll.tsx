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
    DollarSign,
} from 'lucide-react';

interface Payroll {
    id: number;
    employee_id: number;
    basic_salary: number;
    bonus: number;
    deductions: number;
    net_salary: number;
    pay_date: string;
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
    payrolls: Payroll[];
    employees: Employee[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    page: number;
    search?: string;
    month?: string;
}

const PAYROLL_URL = '/payroll';

export default function PayrollPage({ 
    payrolls: initialPayrolls, 
    employees,
    meta, 
    page: currentPage,
    search: initialSearch = '',
    month: initialMonth = ''
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [month, setMonth] = useState(initialMonth);
    const [payrolls] = useState<Payroll[]>(initialPayrolls);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
    const [deletingPayroll, setDeletingPayroll] = useState<Payroll | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(PAYROLL_URL, { 
            search: search || undefined, 
            month: month || undefined,
            page: 1 
        }, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(PAYROLL_URL, { page: newPage }, { replace: true });
    };

    const openModal = (payroll?: Payroll) => {
        if (payroll) {
            setEditingPayroll(payroll);
        } else {
            setEditingPayroll(null);
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPayroll(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const method = editingPayroll ? 'PUT' : 'POST';
            const url = editingPayroll 
                ? `/payroll/${editingPayroll.id}` 
                : '/payroll';

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
        if (!deletingPayroll) return;
        setSaving(true);

        try {
            const response = await fetch(`/payroll/${deletingPayroll.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Cannot delete payroll');
                setSaving(false);
                setDeletingPayroll(null);
                return;
            }

            window.location.reload();
        } catch (error) {
            alert('An unexpected error occurred');
            setSaving(false);
            setDeletingPayroll(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const calculateNetSalary = (basic: number, bonus: number, deductions: number) => {
        return (basic + bonus) - deductions;
    };

    return (
        <>
            <Head title="Payroll" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            Payroll
                        </h1>
                        <p className="text-sm text-neutral-500">Manage employee payroll records</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add Payroll
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
                        type="month"
                        name="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    />
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
                                    <th className="px-4 py-3 font-medium text-right">Basic Salary</th>
                                    <th className="px-4 py-3 font-medium text-right">Bonus</th>
                                    <th className="px-4 py-3 font-medium text-right">Deductions</th>
                                    <th className="px-4 py-3 font-medium text-right">Net Salary</th>
                                    <th className="px-4 py-3 font-medium">Pay Date</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                                            No payroll records found
                                        </td>
                                    </tr>
                                ) : (
                                    payrolls.map((payroll) => (
                                        <tr key={payroll.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="px-4 py-3">
                                                {payroll.employee ? (
                                                    <span className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-neutral-400" />
                                                        {payroll.employee.first_name} {payroll.employee.last_name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(payroll.basic_salary)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                +{formatCurrency(payroll.bonus)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-600">
                                                -{formatCurrency(payroll.deductions)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                {formatCurrency(payroll.net_salary)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                                    {formatDate(payroll.pay_date)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openModal(payroll)} 
                                                        className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeletingPayroll(payroll)} 
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
                                {editingPayroll ? 'Edit Payroll' : 'Add Payroll'}
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
                                        defaultValue={editingPayroll?.employee_id?.toString() || ''}
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
                                    <label className="mb-1 block text-sm font-medium">Basic Salary</label>
                                    <input
                                        type="number"
                                        name="basic_salary"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editingPayroll?.basic_salary || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="0.00"
                                    />
                                    {errors.basic_salary && (
                                        <p className="mt-1 text-sm text-red-500">{errors.basic_salary}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Bonus</label>
                                    <input
                                        type="number"
                                        name="bonus"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editingPayroll?.bonus || ''}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="0.00"
                                    />
                                    {errors.bonus && (
                                        <p className="mt-1 text-sm text-red-500">{errors.bonus}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Deductions</label>
                                    <input
                                        type="number"
                                        name="deductions"
                                        step="0.01"
                                        min="0"
                                        defaultValue={editingPayroll?.deductions || ''}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="0.00"
                                    />
                                    {errors.deductions && (
                                        <p className="mt-1 text-sm text-red-500">{errors.deductions}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Pay Date</label>
                                    <input
                                        type="date"
                                        name="pay_date"
                                        defaultValue={editingPayroll?.pay_date ? editingPayroll.pay_date.split('T')[0] : ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                    {errors.pay_date && (
                                        <p className="mt-1 text-sm text-red-500">{errors.pay_date}</p>
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
                                        {saving ? 'Saving...' : (editingPayroll ? 'Update' : 'Save')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPayroll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold">Delete Payroll</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete this payroll record?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingPayroll(null)}
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