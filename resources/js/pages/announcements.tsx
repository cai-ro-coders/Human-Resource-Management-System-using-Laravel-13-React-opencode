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
    Megaphone,
    Calendar,
    User,
} from 'lucide-react';

interface Announcement {
    id: number;
    title: string;
    content: string;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

interface Props {
    announcements: Announcement[];
    meta: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    page: number;
    search?: string;
}

const ANNOUNCEMENTS_URL = '/announcements';

export default function AnnouncementsPage({ 
    announcements: initialAnnouncements, 
    meta, 
    page: currentPage,
    search: initialSearch = ''
}: Props) {
    const [search, setSearch] = useState(initialSearch);
    const [announcements] = useState<Announcement[]>(initialAnnouncements);
    const [loading, setLoading] = useState(false);
    const page = currentPage;
    const totalPages = meta.last_page;
    const total = meta.total;
    const perPage = meta.per_page;

    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(ANNOUNCEMENTS_URL, { 
            search: search || undefined, 
            page: 1 
        }, { replace: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get(ANNOUNCEMENTS_URL, { page: newPage }, { replace: true });
    };

    const openModal = (announcement?: Announcement) => {
        if (announcement) {
            setEditingAnnouncement(announcement);
        } else {
            setEditingAnnouncement(null);
        }
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAnnouncement(null);
        setErrors({});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const method = editingAnnouncement ? 'PUT' : 'POST';
            const url = editingAnnouncement 
                ? `/announcements/${editingAnnouncement.id}` 
                : '/announcements';

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
        if (!deletingAnnouncement) return;
        setSaving(true);

        try {
            const response = await fetch(`/announcements/${deletingAnnouncement.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || 'Cannot delete announcement');
                setSaving(false);
                setDeletingAnnouncement(null);
                return;
            }

            window.location.reload();
        } catch (error) {
            alert('An unexpected error occurred');
            setSaving(false);
            setDeletingAnnouncement(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head title="Announcements" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
                            Announcements
                        </h1>
                        <p className="text-sm text-neutral-500">Company announcements and notices</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        New Announcement
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        placeholder="Search announcements..."
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
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {announcements.length === 0 ? (
                                <div className="px-4 py-8 text-center text-neutral-500">
                                    No announcements found
                                </div>
                            ) : (
                                announcements.map((announcement) => (
                                    <div key={announcement.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Megaphone className="h-5 w-5 text-blue-500" />
                                                    <h3 className="text-lg font-semibold">{announcement.title}</h3>
                                                </div>
                                                <p className="text-neutral-600 dark:text-neutral-400 mb-2">{announcement.content}</p>
                                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {announcement.user?.name || 'Admin'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(announcement.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => openModal(announcement)} 
                                                    className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeletingAnnouncement(announcement)} 
                                                    className="rounded p-1 text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500">
                            Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} announcements
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
                                {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                            </h2>
                            <button onClick={closeModal} className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={editingAnnouncement?.title || ''}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="Announcement title"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Content</label>
                                    <textarea
                                        name="content"
                                        defaultValue={editingAnnouncement?.content || ''}
                                        rows={5}
                                        required
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        placeholder="Announcement content..."
                                    />
                                    {errors.content && (
                                        <p className="mt-1 text-sm text-red-500">{errors.content}</p>
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
                                        {saving ? 'Saving...' : (editingAnnouncement ? 'Update' : 'Post')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-neutral-900">
                        <h2 className="mb-4 text-lg font-semibold">Delete Announcement</h2>
                        <p className="mb-4 text-neutral-500">
                            Are you sure you want to delete this announcement?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingAnnouncement(null)}
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