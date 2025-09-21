// resources/js/pages/Guru/Penilaian/Submission.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// ⬇️ HAPUS import Breadcrumb komponen lokal (kita pakai AppLayout breadcrumbs di header)
// import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Download, Eye, FileText, Link as LinkIcon, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Subject {
    id: number;
    kode: string;
    nama: string;
}

interface Section {
    id: number;
    nama: string;
    subject: Subject;
}

interface Assignment {
    id: number;
    judul: string;
    deskripsi: string;
    deadline: string;
    section: Section;
}

interface User {
    id: number;
    name: string;
    nis?: string;
}

interface Submission {
    id: number;
    user: User;
    konten_teks?: string;
    file_path?: string;
    link_url?: string;
    submitted_at: string;
    score?: number;
    feedback?: string;
    is_late: boolean;
    created_at: string;
}

interface Props {
    assignment: Assignment;
    submissions: Submission[];
}

// ❗ gunakan bentuk breadcrumb seperti Tugas/Index.tsx: { title, href }
type Crumb = { title: string; href: string };

export default function SubmissionIndex({ assignment, submissions }: Props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [scoreFilter, setScoreFilter] = useState('all');

    // Breadcrumbs di header (AppLayout)
    const breadcrumbs: Crumb[] = [
        { title: 'Dashboard', href: '/guru/dashboard' },
        { title: 'Kelas', href: '/guru/kelas' },
        { title: assignment.section.subject.nama, href: `/guru/kelas/${assignment.section.id}` },
        { title: 'Penilaian', href: route('guru.penilaian.submissions', assignment.id) },
    ];

    // Filter submissions
    const filteredSubmissions = submissions.filter((submission) => {
        const matchesSearch =
            submission.user.name.toLowerCase().includes(search.toLowerCase()) || submission.user.nis?.toLowerCase().includes(search.toLowerCase());

        const isGraded = submission.score != null; // true jika bukan null/undefined
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'graded' && isGraded) ||
            (statusFilter === 'ungraded' && !isGraded) ||
            (statusFilter === 'late' && submission.is_late);

        const matchesScore =
            scoreFilter === 'all' ||
            (scoreFilter === 'high' && submission.score != null && submission.score >= 80) ||
            (scoreFilter === 'medium' && submission.score != null && submission.score >= 60 && submission.score < 80) ||
            (scoreFilter === 'low' && submission.score != null && submission.score < 60);

        return matchesSearch && matchesStatus && matchesScore;
    });

    const handleBulkExport = () => {
        router.get(route('guru.penilaian.export', assignment.section.id));
        toast.success('Export nilai berhasil diunduh');
    };

    const getScoreBadge = (score?: number) => {
        if (score == null) {
            return <Badge variant="secondary">Belum Dinilai</Badge>;
        }
        if (score >= 80) return <Badge className="bg-green-100 text-green-800">A ({score})</Badge>;
        if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">B ({score})</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">C ({score})</Badge>;
        return <Badge className="bg-red-100 text-red-800">D ({score})</Badge>;
    };

    const getSubmissionTypeBadge = (submission: Submission) => {
        if (submission.file_path) {
            return (
                <Badge variant="outline">
                    <FileText className="mr-1 h-3 w-3" />
                    File
                </Badge>
            );
        } else if (submission.link_url) {
            return (
                <Badge variant="outline">
                    <LinkIcon className="mr-1 h-3 w-3" />
                    Link
                </Badge>
            );
        }
        return <Badge variant="outline">Teks</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Penilaian - ${assignment.judul}`} />

            <div className="space-y-6 p-6">
                {/* Header (breadcrumb sudah di AppLayout header) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/guru/kelas/${assignment.section.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{assignment.judul}</h1>
                            <p className="text-gray-600">
                                {assignment.section.subject.kode} - {assignment.section.subject.nama}
                            </p>
                            <p className="text-sm text-gray-500">
                                Deadline: {format(new Date(assignment.deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBulkExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Nilai
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Submission</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissions.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sudah Dinilai</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissions.filter((s) => s.score != null).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Belum Dinilai</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissions.filter((s) => s.score == null).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissions.filter((s) => s.is_late).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Input
                                        placeholder="Cari nama siswa atau NIS..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Status Penilaian" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="graded">Sudah Dinilai</SelectItem>
                                    <SelectItem value="ungraded">Belum Dinilai</SelectItem>
                                    <SelectItem value="late">Terlambat</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={scoreFilter} onValueChange={setScoreFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Rentang Nilai" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Nilai</SelectItem>
                                    <SelectItem value="high">Tinggi (≥80)</SelectItem>
                                    <SelectItem value="medium">Sedang (60-79)</SelectItem>
                                    <SelectItem value="low">Rendah (&lt;60)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Submission ({filteredSubmissions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Siswa</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>Waktu Submit</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Nilai</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                            Tidak ada submission yang ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubmissions.map((submission) => (
                                        <TableRow key={submission.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{submission.user.name}</div>
                                                    {submission.user.nis && <div className="text-sm text-gray-500">NIS: {submission.user.nis}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getSubmissionTypeBadge(submission)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm">
                                                        {format(new Date(submission.submitted_at), 'dd/MM/yyyy', { locale: id })}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {format(new Date(submission.submitted_at), 'HH:mm', { locale: id })}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {submission.is_late ? (
                                                        <Badge variant="destructive">Terlambat</Badge>
                                                    ) : (
                                                        <Badge variant="default">Tepat Waktu</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getScoreBadge(submission.score)}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('guru.penilaian.show', submission.id)}>
                                                            <Eye className="mr-1 h-3 w-3" />
                                                            {submission.score != null ? 'Edit' : 'Nilai'}
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
