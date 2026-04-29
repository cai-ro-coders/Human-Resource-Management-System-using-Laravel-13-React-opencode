import { useState } from 'react';
import { Head, Link as InertiaLink, router } from '@inertiajs/react';
import { employees as employeesRoute } from '@/routes';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    gender: string | null;
    date_of_birth: string | null;
    address: string | null;
    hire_date: string;
    department_id: number | null;
    position_id: number | null;
    status: string;
    profile_photo: string | null;
    profile_photo_url: string | null;
    department?: { id: number; name: string };
    position?: { id: number; title: string };
}

interface Department {
    id: number;
    name: string;
}

interface Position {
    id: number;
    department_id: number;
    title: string;
    department?: { id: number; name: string };
}

interface Props {
    employees: Employee[];
    departments: Department[];
    positions: Position[];
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

export default function Employees({ 
    employees: initialEmployees, 
    departments, 
    positions, 
    meta, 
    page: currentPage,
    search: initialSearch = '',
    status: initialStatus = 'all'
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);
    
    const [employees] = useState<Employee[]>(initialEmployees);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        address: '',
        hire_date: new Date().toISOString().split('T')[0],
        department_id: '',
        position_id: '',
        status: 'active',
        profile_photo: null as File | null,
    });

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(employeesRoute(), { search: search || undefined, status: status, page: 1 }, { replace: true });
    };

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get(employeesRoute(), { search: search || undefined, status: newStatus, page: 1 }, { replace: true });
    };

    const openModal = (employee?: Employee) => {
        if (employee) {
            setEditingEmployee(employee);
            setPhotoPreview(employee.profile_photo_url || (employee.profile_photo ? `/${employee.profile_photo}` : null));
            setFormData({
                employee_id: employee.employee_id,
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                phone: employee.phone || '',
                gender: employee.gender || '',
                date_of_birth: employee.date_of_birth || '',
                address: employee.address || '',
                hire_date: employee.hire_date,
                department_id: employee.department_id?.toString() || '',
                position_id: employee.position_id?.toString() || '',
                status: employee.status,
                profile_photo: null,
            });
        } else {
            setEditingEmployee(null);
            setPhotoPreview(null);
            const nextId = `EMP${String(total + 1).padStart(4, '0')}`;
            setFormData({
                employee_id: nextId,
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                gender: '',
                date_of_birth: '',
                address: '',
                hire_date: new Date().toISOString().split('T')[0],
                department_id: '',
                position_id: '',
                status: 'active',
                profile_photo: null,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setPhotoPreview(null);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, profile_photo: file });
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formPayload = new FormData();
            formPayload.append('employee_id', formData.employee_id);
            formPayload.append('first_name', formData.first_name);
            formPayload.append('last_name', formData.last_name);
            formPayload.append('email', formData.email);
            formPayload.append('phone', formData.phone);
            formPayload.append('gender', formData.gender);
            formPayload.append('date_of_birth', formData.date_of_birth);
            formPayload.append('address', formData.address);
            formPayload.append('hire_date', formData.hire_date);
            formPayload.append('department_id', formData.department_id);
            formPayload.append('position_id', formData.position_id);
            formPayload.append('status', formData.status);
            
            if (formData.profile_photo instanceof File) {
                formPayload.append('profile_photo', formData.profile_photo);
            }

            let res;
            if (editingEmployee) {
                // Add _method override for PUT
                const putFormData = new FormData();
                putFormData.append('_method', 'PUT');
                formPayload.forEach((value, key) => {
                    putFormData.append(key, value);
                });
                res = await fetch(`/api/employees/${editingEmployee.id}`, {
                    method: 'POST',
                    body: putFormData,
                });
            } else {
                res = await fetch('/api/employees', {
                    method: 'POST',
                    body: formPayload,
                });
            }

            if (res.ok) {
                closeModal();
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to save employee:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingEmployee) return;
        setSaving(true);

        try {
            const res = await fetch(`/api/employees/${deletingEmployee.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setDeletingEmployee(null);
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to delete employee:', error);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (empStatus: string) => {
        switch (empStatus) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'inactive': return 'bg-yellow-100 text-yellow-700';
            case 'terminated': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredPositions = positions.filter(
        (p) => !formData.department_id || p.department_id === parseInt(formData.department_id)
    );

    return (
        <>
            <Head title="Employees" />
            <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Employees</h1>
                        <p className="text-sm text-neutral-500">{total} employees</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Employee
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-neutral-200 pl-10 pr-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="rounded-lg border border-neutral-200 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Search
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
                                    <th className="px-4 py-3 font-medium">Photo</th>
                                    <th className="px-4 py-3 font-medium">Employee ID</th>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Department</th>
                                    <th className="px-4 py-3 font-medium">Position</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                                            No employees found
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr key={emp.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="px-4 py-3">
                                                {emp.profile_photo_url ? (
                                                    <img 
                                                        src={emp.profile_photo_url} 
                                                        alt={`${emp.first_name} ${emp.last_name}`}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-700">
                                                        <span className="text-xs font-medium">
                                                            {emp.first_name[0]}{emp.last_name[0]}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{emp.employee_id}</td>
                                            <td className="px-4 py-3">{emp.first_name} {emp.last_name}</td>
                                            <td className="px-4 py-3 text-neutral-500">{emp.email}</td>
                                            <td className="px-4 py-3">{emp.department?.name || '-'}</td>
                                            <td className="px-4 py-3">{emp.position?.title || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(emp.status)}`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openModal(emp)} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setDeletingEmployee(emp)} className="rounded p-1 text-red-500 hover:bg-red-50">
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

                <div className="flex items-center justify-center gap-1">
                    <InertiaLink
                        href={`/employees?page=${Math.max(1, page - 1)}`}
                        className={`rounded px-2 py-1 ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    >
                        ‹
                    </InertiaLink>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <InertiaLink
                            key={pageNum}
                            href={`/employees?page=${pageNum}`}
                            className={`min-w-[2rem] rounded px-2 py-1 text-center ${
                                page === pageNum
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                        >
                            {pageNum}
                        </InertiaLink>
                    ))}
                    <InertiaLink
                        href={`/employees?page=${Math.min(totalPages, page + 1)}`}
                        className={`rounded px-2 py-1 ${page === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    >
                        ›
                    </InertiaLink>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
                            </h2>
                            <button onClick={closeModal} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-neutral-400">No Photo</span>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer hover:bg-blue-700">
                                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                        +
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Employee ID</label>
                                    <input
                                        type="text"
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                                        required
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        required
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        required
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Hire Date</label>
                                    <input
                                        type="date"
                                        value={formData.hire_date}
                                        onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                        required
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Department</label>
                                <select
                                    value={formData.department_id}
                                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value, position_id: '' })}
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Position</label>
                                <select
                                    value={formData.position_id}
                                    onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    <option value="">Select Position</option>
                                    {filteredPositions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>{pos.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    rows={2}
                                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button type="button" onClick={closeModal} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {editingEmployee ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-2 text-lg font-semibold">Delete Employee</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete <strong>{deletingEmployee.first_name} {deletingEmployee.last_name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeletingEmployee(null)} className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700">
                                Cancel
                            </button>
                            <button onClick={handleDelete} disabled={saving} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Employees.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: employeesRoute() },
    ],
};