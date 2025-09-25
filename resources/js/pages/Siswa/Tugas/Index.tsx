import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState } from 'react';

interface Subject {
    id: number;
    nama: string;
}

interface Section {
    id: number;
    subject: Subject;
    guru: {
        id: number;
        name: string;
    };
}

interface Submission {
    id: number;
    konten_teks: string | null;
    file_path: string | null;
    link_url: string | null;
    submitted_at: string;
    score: number | null;
    feedback: string | null;
}

interface Assignment {
    id: number;
    judul: string;
    deskripsi: string;
    deadline: string;
    section_id: number;
    section: Section;
    submission_status: 'pending' | 'submitted' | 'overdue';
    submission: Submission | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
}

interface Props {
    assignments: Paginator<Assignment>;
    subjects: Subject[];
    filters: {
        status?: string;
        subject_id?: string;
    };
}

export default function Index({ assignments, subjects, filters }: Props) {
    type FlashProps = { success?: string; error?: string };
    const { flash } = usePage<{ flash?: FlashProps }>().props;

    // Gunakan sentinel 'all' agar tidak ada value="" pada SelectItem
    const [status, setStatus] = useState<string>(filters.status && filters.status !== '' ? String(filters.status) : 'all');
    const [subjectId, setSubjectId] = useState<string>(filters.subject_id && filters.subject_id !== '' ? String(filters.subject_id) : 'all');

    const handleStatusChange = (value: string) => {
        setStatus(value);
        const params: Record<string, string> = {};
        if (value !== 'all') params.status = value;
        if (subjectId !== 'all') params.subject_id = subjectId;
        router.get(route('siswa.tugas.index'), params, { preserveState: true, preserveScroll: true });
    };

    const handleSubjectChange = (value: string) => {
        setSubjectId(value);
        const params: Record<string, string> = {};
        if (status !== 'all') params.status = status;
        if (value !== 'all') params.subject_id = value;
        router.get(route('siswa.tugas.index'), params, { preserveState: true, preserveScroll: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline">Belum Dikumpulkan</Badge>;
            case 'submitted':
                return <Badge variant="secondary">Sudah Dikumpulkan</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Terlambat</Badge>;
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Daftar Tugas" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900">Daftar Tugas</h1>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                        <div className="w-full sm:w-1/3 md:w-1/4">
                            <Select value={status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Belum Dikumpulkan</SelectItem>
                                    <SelectItem value="submitted">Sudah Dikumpulkan</SelectItem>
                                    <SelectItem value="overdue">Terlambat</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-full sm:w-1/3 md:w-1/4">
                            <Select value={subjectId} onValueChange={handleSubjectChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter Mata Pelajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                            {subject.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {flash?.success && <div className="mt-4 rounded-md bg-green-100 p-4 text-green-700">{flash.success}</div>}
                    {flash?.error && <div className="mt-4 rounded-md bg-red-100 p-4 text-red-700">{flash.error}</div>}

                    <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {assignments.data.length > 0 ? (
                            assignments.data.map((assignment) => (
                                <Card key={assignment.id} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-lg font-medium">{assignment.judul}</CardTitle>
                                            {getStatusBadge(assignment.submission_status)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {assignment.section.subject.nama} - {assignment.section.guru.name}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 line-clamp-2 text-sm">{assignment.deskripsi}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm">
                                                <p className="font-medium">Deadline:</p>
                                                <p>
                                                    {format(new Date(assignment.deadline), 'dd MMMM yyyy, HH:mm', {
                                                        locale: id,
                                                    })}
                                                </p>
                                            </div>
                                            <Button asChild size="sm">
                                                <Link href={route('siswa.tugas.show', assignment.id)}>Lihat Detail</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center">
                                <p className="text-gray-500">Tidak ada tugas yang ditemukan.</p>
                            </div>
                        )}
                    </div>

                    {assignments.data.length > 0 && (assignments.last_page ?? 1) > 1 && (
                        <div className="mt-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {assignments.from ?? 0} - {assignments.to ?? 0} dari {assignments.total} tugas
                                </div>
                                <div className="flex items-center gap-2">
                                    {assignments.links.map((link, index) => {
                                        if (link.label.includes('Previous')) {
                                            return (
                                                <Button
                                                    key={`prev-${index}`}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    Previous
                                                </Button>
                                            );
                                        }
                                        if (link.label.includes('Next')) {
                                            return (
                                                <Button
                                                    key={`next-${index}`}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    Next
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={`page-${index}`}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
