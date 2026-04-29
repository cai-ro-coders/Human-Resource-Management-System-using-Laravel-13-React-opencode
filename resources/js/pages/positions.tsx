import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { positions as positionsRoute } from '@/routes';
import {
    Search,
    Pencil,
    Trash2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface Position {
    id: number;
    title: string;
    description: string | null;
    department_id: number;
    department?: { id: number; name: string };
    created_at: string;
    updated_at: string;
}

interface Department {
    id: number;
    name: string;
}

interface Props {
    positions: Position[];
    departments: Department[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    page: number;
    search?: string;
}

export default function PositionsPage({ 
    positions: initialPositions, 
    departments,
    meta, 
    page: currentPage,
    search: initialSearch = ''
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [positions] = useState<Position[]>(initialPositions);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingPosition, setEditingPosition] = useState<Position | null>(null);
    const [deletingPosition, setDeletingPosition] = useState<Position | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(positionsRoute(), { search: search || undefined, page: 1 }, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(positionsRoute(), { page: newPage }, { replace: true });
    };

    const openModal = (position?: Position) => {
        if (position) {
            setEditingPosition(position);
        } else {
            setEditingPosition(null);
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPosition(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const method = editingPosition ? 'PUT' : 'POST';
            const url = editingPosition 
                ? `/positions/${editingPosition.id}` 
                : '/positions';

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
        if (!deletingPosition) return;
        setSaving(true);

        try {
            const response = await fetch(`/positions/${deletingPosition.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Cannot delete position');
                setSaving(false);
                setDeletingPosition(null);
                return;
            }

            window.location.reload();
        } catch (error) {
            alert('An unexpected error occurred');
            setSaving(false);
            setDeletingPosition(null);
        }
    };

    return (
        <>
            <Head title="Positions" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            Positions
                        </h1>
                        <p className="text-sm text-neutral-500">Manage your organization's positions</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Add Position
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search positions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    />
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
                                    <th className="px-4 py-3 font-medium">Title</th>
                                    <th className="px-4 py-3 font-medium">Department</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {positions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                                            No positions found
                                        </td>
                                    </tr>
                                ) : (
                                    positions.map((pos) => (
                                        <tr key={pos.id} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                            <td className="px-4 py-3 font-medium">{pos.title}</td>
                                            <td className="px-4 py-3">
                                                {pos.department?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-neutral-500">{pos.description || '-'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => openModal(pos)} 
                                                        className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeletingPosition(pos)} 
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
                            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} positions
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
                                {editingPosition ? 'Edit Position' : 'Add Position'}
                            </h2>
                            <button onClick={closeModal} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Position Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={editingPosition?.title || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="e.g., Senior Developer"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Department</label>
                                    <select
                                        name="department_id"
                                        defaultValue={editingPosition?.department_id?.toString() || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                    >
                                        <option value="">Select Department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id.toString()}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.department_id && (
                                        <p className="mt-1 text-sm text-red-500">{errors.department_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingPosition?.description || ''}
                                        rows={3}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="Brief description of the position..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-500">{errors.description}</p>
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
                                        {saving ? 'Saving...' : (editingPosition ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPosition && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold">Delete Position</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete "<strong>{deletingPosition.title}</strong>"?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingPosition(null)}
                                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 dark:border-neutral-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={saving}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {saving ? 'Deleting...' : 'Delete Position'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}