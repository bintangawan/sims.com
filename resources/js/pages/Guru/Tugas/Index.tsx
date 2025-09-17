// resources/js/pages/Guru/Tugas/Index.tsx
import { Badge } from '@/components/ui/badge';
// ⛔️ (hapus) import breadcrumb sub-komponen karena gak dipakai di body
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, Clock, Edit, Eye, MoreVertical, Plus, Search, Trash2, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Types
interface Subject {
    id: number;
    kode: string;
    nama: string;
}

interface Section {
    id: number;
    subject: Subject;
}

interface Assignment {
    id: number;
    judul: string;
    deskripsi: string;
    tipe: 'file' | 'teks' | 'link' | 'campuran';
    deadline: string;
    published_at: string | null;
    submissions_count: number;
    is_published: boolean;
    is_overdue: boolean;
    created_at: string;
}

interface Props {
    section: Section;
    assignments: Assignment[];
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

const breadcrumbs: BreadcrumbItemType[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Kelas', href: '/guru/kelas' },
    { title: 'Tugas', href: '/guru/tugas' },
];

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'file':
            return 'File';
        case 'teks':
            return 'Teks';
        case 'link':
            return 'Link';
        case 'campuran':
            return 'Campuran';
        default:
            return type;
    }
};

const getTypeBadgeVariant = (type: string) => {
    switch (type) {
        case 'file':
            return 'default';
        case 'teks':
            return 'secondary';
        case 'link':
            return 'outline';
        case 'campuran':
            return 'destructive';
        default:
            return 'default';
    }
};

const handleDelete = (assignmentId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        router.delete(`/guru/tugas/${assignmentId}`, {
            onSuccess: () => toast.success('Tugas berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus tugas'),
        });
    }
};

const handlePublish = (assignmentId: number) => {
    router.patch(
        `/guru/tugas/${assignmentId}/publish`,
        {},
        {
            onSuccess: () => toast.success('Status publikasi tugas berhasil diubah'),
            onError: () => toast.error('Gagal mengubah status publikasi'),
        },
    );
};

export default function TugasIndex({ section, assignments }: Props) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch =
            assignment.judul.toLowerCase().includes(search.toLowerCase()) || assignment.deskripsi.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || assignment.tipe === typeFilter;
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'published' && assignment.is_published) ||
            (statusFilter === 'draft' && !assignment.is_published) ||
            (statusFilter === 'overdue' && assignment.is_overdue);

        return matchesSearch && matchesType && matchesStatus;
    });

    // breadcrumb dinamis per section
    const dynamicCrumbs: BreadcrumbItemType[] = [
        { title: section.subject.nama, href: `/guru/kelas/${section.id}` },
        { title: 'Tugas', href: `/guru/tugas?section_id=${section.id}` },
    ];
    const allCrumbs = [...breadcrumbs, ...dynamicCrumbs];

    return (
        // ⬅️ kirim allCrumbs ke AppLayout supaya breadcrumb tampil di header (sejajar toggle)
        <AppLayout breadcrumbs={allCrumbs}>
            <Head title={`Tugas - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tugas - {section.subject.nama}</h1>
                        <p className="text-muted-foreground">Kelola tugas untuk kelas {section.subject.nama}</p>
                    </div>
                    <Link href={`/guru/tugas/create?section_id=${section.id}`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Tugas
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Cari tugas..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">Semua Tipe</option>
                                <option value="file">File</option>
                                <option value="teks">Teks</option>
                                <option value="link">Link</option>
                                <option value="campuran">Campuran</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="all">Semua Status</option>
                                <option value="published">Dipublikasikan</option>
                                <option value="draft">Draft</option>
                                <option value="overdue">Terlambat</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tugas</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignments.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dipublikasikan</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignments.filter((a) => a.is_published).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft</CardTitle>
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignments.filter((a) => !a.is_published).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pengumpulan</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignments.reduce((sum, a) => sum + a.submissions_count, 0)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assignment List */}
                <div className="space-y-4">
                    {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment) => (
                            <Card key={assignment.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">{assignment.judul}</CardTitle>
                                                <Badge variant={getTypeBadgeVariant(assignment.tipe)}>{getTypeLabel(assignment.tipe)}</Badge>
                                                {assignment.is_published ? (
                                                    <Badge variant="default">Dipublikasikan</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Draft</Badge>
                                                )}
                                                {assignment.is_overdue && <Badge variant="destructive">Terlambat</Badge>}
                                            </div>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">{assignment.deskripsi}</p>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/guru/tugas/${assignment.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Lihat Detail
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/guru/tugas/${assignment.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePublish(assignment.id)}>
                                                    {assignment.is_published ? (
                                                        <>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Sembunyikan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Publikasikan
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(assignment.id)} className="text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <span>Deadline: {format(new Date(assignment.deadline), 'dd MMM yyyy HH:mm', { locale: id })}</span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                {assignment.submissions_count} pengumpulan
                                            </span>
                                        </div>
                                        <span>Dibuat: {format(new Date(assignment.created_at), 'dd MMM yyyy', { locale: id })}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    {search || typeFilter !== 'all' || statusFilter !== 'all'
                                        ? 'Tidak ada tugas yang sesuai dengan filter'
                                        : 'Belum ada tugas untuk kelas ini'}
                                </p>
                                {!search && typeFilter === 'all' && statusFilter === 'all' && (
                                    <Link href={`/guru/tugas/create?section_id=${section.id}`}>
                                        <Button className="mt-4">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Buat Tugas Pertama
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
