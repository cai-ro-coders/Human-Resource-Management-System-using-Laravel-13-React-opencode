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
    Download,
    Eye,
} from 'lucide-react';

interface Payslip {
    id: number;
    payroll_id: number;
    generated_at: string;
    file_path: string | null;
    payroll?: {
        id: number;
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
    };
}

interface Payroll {
    id: number;
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

interface Props {
    payslips: Payslip[];
    payrolls: Payroll[];
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

const PAYSLIP_URL = '/payslip';

export default function PayslipPage({ 
    payslips: initialPayslips, 
    payrolls,
    meta, 
    page: currentPage,
    search: initialSearch = '',
    month: initialMonth = ''
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [month, setMonth] = useState(initialMonth);
    const [payslips] = useState<Payslip[]>(initialPayslips);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingPayslip, setEditingPayslip] = useState<Payslip | null>(null);
    const [deletingPayslip, setDeletingPayslip] = useState<Payslip | null>(null);
    const [viewingPayslip, setViewingPayslip] = useState<Payslip | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(PAYSLIP_URL, { 
            search: search || undefined, 
            month: month || undefined,
            page: 1 
        }, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(PAYSLIP_URL, { page: newPage }, { replace: true });
    };

    const openModal = (payslip?: Payslip) => {
        if (payslip) {
            setEditingPayslip(payslip);
        } else {
            setEditingPayslip(null);
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPayslip(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const method = editingPayslip ? 'PUT' : 'POST';
            const url = editingPayslip 
                ? `/payslip/${editingPayslip.id}` 
                : '/payslip';

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
        if (!deletingPayslip) return;
        setSaving(true);

        try {
            const response = await fetch(`/payslip/${deletingPayslip.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Cannot delete payslip');
                setSaving(false);
                setDeletingPayslip(null);
                return;
            }

            window.location.reload();
        } catch (error) {
            alert('An unexpected error occurred');
            setSaving(false);
            setDeletingPayslip(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatPayDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <>
            <Head title="Payslips" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            Payslips
                        </h1>
                        <p className="text-sm text-neutral-500">Generate and manage employee payslips</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Generate Payslip
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
                                    <th className="px-4 py-3 font-medium">Pay Period</th>
                                    <th className="px-4 py-3 font-medium text-right">Basic Salary</th>
                                    <th className="px-4 py-3 font-medium text-right">Bonus</th>
                                    <th className="px-4 py-3 font-medium text-right">Deductions</th>
                                    <th className="px-4 py-3 font-medium text-right">Net Salary</th>
                                    <th className="px-4 py-3 font-medium">Generated</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payslips.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                                            No payslips found
                                        </td>
                                    </tr>
                                ) : (
                                    payslips.map((payslip) => (
                                        <tr key={payslip.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="px-4 py-3">
                                                {payslip.payroll?.employee ? (
                                                    <span className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-neutral-400" />
                                                        {payslip.payroll.employee.first_name} {payslip.payroll.employee.last_name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-neutral-400" />
                                                    {payslip.payroll ? formatPayDate(payslip.payroll.pay_date) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {payslip.payroll ? formatCurrency(payslip.payroll.basic_salary) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                +{payslip.payroll ? formatCurrency(payslip.payroll.bonus) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-600">
                                                -{payslip.payroll ? formatCurrency(payslip.payroll.deductions) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold">
                                                {payslip.payroll ? formatCurrency(payslip.payroll.net_salary) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-500">
                                                {formatDate(payslip.generated_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => setViewingPayslip(payslip)} 
                                                        className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                        title="View"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => openModal(payslip)} 
                                                        className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeletingPayslip(payslip)} 
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
                                {editingPayslip ? 'Edit Payslip' : 'Generate Payslip'}
                            </h2>
                            <button onClick={closeModal} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Payroll Record</label>
                                    <select
                                        name="payroll_id"
                                        defaultValue={editingPayslip?.payroll_id?.toString() || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="">Select Payroll</option>
                                        {payrolls.map((p) => (
                                            <option key={p.id} value={p.id.toString()}>
                                                {p.employee?.first_name} {p.employee?.last_name} - {formatPayDate(p.pay_date)} ({formatCurrency(p.net_salary)})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.payroll_id && (
                                        <p className="mt-1 text-sm text-red-500">{errors.payroll_id}</p>
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
                                        {saving ? 'Generating...' : (editingPayslip ? 'Update' : 'Generate')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Payslip Modal */}
            {viewingPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Payslip Details</h2>
                            <button onClick={() => setViewingPayslip(null)} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-neutral-500">Employee</p>
                                    <p className="font-medium">
                                        {viewingPayslip.payroll?.employee?.first_name} {viewingPayslip.payroll?.employee?.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Employee ID</p>
                                    <p className="font-medium">{viewingPayslip.payroll?.employee?.employee_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Pay Period</p>
                                    <p className="font-medium">
                                        {viewingPayslip.payroll ? formatPayDate(viewingPayslip.payroll.pay_date) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-neutral-500">Generated</p>
                                    <p className="font-medium">{formatDate(viewingPayslip.generated_at)}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between py-1">
                                    <span>Basic Salary</span>
                                    <span className="font-medium">{viewingPayslip.payroll ? formatCurrency(viewingPayslip.payroll.basic_salary) : '-'}</span>
                                </div>
                                <div className="flex justify-between py-1 text-green-600">
                                    <span>Bonus</span>
                                    <span>+{viewingPayslip.payroll ? formatCurrency(viewingPayslip.payroll.bonus) : '-'}</span>
                                </div>
                                <div className="flex justify-between py-1 text-red-600">
                                    <span>Deductions</span>
                                    <span>-{viewingPayslip.payroll ? formatCurrency(viewingPayslip.payroll.deductions) : '-'}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                    <span>Net Salary</span>
                                    <span>{viewingPayslip.payroll ? formatCurrency(viewingPayslip.payroll.net_salary) : '-'}</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    onClick={() => setViewingPayslip(null)}
                                    className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold">Delete Payslip</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete this payslip?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingPayslip(null)}
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