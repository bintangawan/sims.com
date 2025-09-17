// resources/js/pages/Guru/Tugas/Show.tsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useState } from 'react';
// ⬇️ gunakan sub-komponen breadcrumb shadcn
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { AlertCircle, ArrowLeft, Calendar, Edit, Eye, EyeOff, FileText, Trash2, Users } from 'lucide-react';
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

interface RubrikItem {
    kriteria: string;
    bobot: number;
    deskripsi: string;
}

interface User {
    id: number;
    name: string;
    nis: string | null;
}

interface Submission {
    id: number;
    user: User;
    submitted_at: string | null;
    score: number | null;
    feedback: string | null;
    is_late: boolean;
}

interface Assignment {
    id: number;
    judul: string;
    deskripsi: string;
    tipe: 'file' | 'teks' | 'link' | 'campuran';
    deadline: string;
    rubrik_json: RubrikItem[] | null;
    published_at: string | null;
    section: Section;
    submissions: Submission[];
    created_at: string;
}

interface Props {
    assignment: Assignment;
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

const baseCrumbs: BreadcrumbItemType[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Kelas', href: '/guru/kelas' },
];

export default function TugasShow({ assignment }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = () => {
        setIsPublishing(true);
        router.patch(
            `/guru/tugas/${assignment.id}/publish`,
            {},
            {
                onSuccess: () => {
                    const status = assignment.published_at ? 'disembunyikan' : 'dipublikasikan';
                    toast.success(`Tugas berhasil ${status}`);
                },
                onError: () => {
                    toast.error('Terjadi kesalahan saat mengubah status tugas');
                },
                onFinish: () => setIsPublishing(false),
            },
        );
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/guru/tugas/${assignment.id}`, {
            onSuccess: () => {
                toast.success('Tugas berhasil dihapus');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat menghapus tugas');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const getTypeLabel = (tipe: string) => {
        const types = { file: 'File Upload', teks: 'Teks', link: 'Link', campuran: 'Campuran' };
        return types[tipe as keyof typeof types] || tipe;
    };

    const getStatusBadge = (submission: Submission) => {
        if (!submission.submitted_at) return <Badge variant="destructive">Belum Dikumpul</Badge>;
        if (submission.is_late) return <Badge variant="secondary">Terlambat</Badge>;
        if (submission.score !== null) return <Badge variant="default">Dinilai</Badge>;
        return <Badge variant="outline">Dikumpul</Badge>;
    };

    const submittedCount = assignment.submissions.filter((s) => s.submitted_at).length;
    const totalStudents = assignment.submissions.length;
    const scored = assignment.submissions.filter((s) => s.score !== null);
    const averageScore = scored.length > 0 ? scored.reduce((acc, s) => acc + (s.score || 0), 0) / scored.length : 0;

    // Breadcrumbs dinamis + statis
    const dynamicCrumbs: BreadcrumbItemType[] = [
        { title: assignment.section.subject.nama, href: `/guru/kelas/${assignment.section.id}` },
        { title: 'Tugas', href: `/guru/tugas?section_id=${assignment.section.id}` },
        { title: assignment.judul, href: `/guru/tugas/${assignment.id}` },
    ];
    const allCrumbs = [...baseCrumbs, ...dynamicCrumbs];

    return (
        <AppLayout>
            <Head title={`Detail Tugas - ${assignment.judul}`} />

            <div className="space-y-6 p-6">
                {/* Top bar: breadcrumb kiri, slot kanan kosong (toggle sidebar di layout) */}
                <div className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {allCrumbs.map((c, idx) => (
                                <React.Fragment key={c.href}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link href={c.href}>{c.title}</Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {idx < allCrumbs.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Detail Tugas</h1>
                        <p className="text-muted-foreground">
                            {assignment.section.subject.kode} - {assignment.section.subject.nama}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => router.get(`/guru/kelas/${assignment.section.id}`)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <Button variant="outline" onClick={() => router.get(`/guru/tugas/${assignment.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant={assignment.published_at ? 'secondary' : 'default'} onClick={handlePublish} disabled={isPublishing}>
                            {assignment.published_at ? (
                                <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Sembunyikan
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Publikasikan
                                </>
                            )}
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Tugas</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus tugas "{assignment.judul}"? Tindakan ini tidak dapat dibatalkan dan akan
                                        menghapus semua submission yang terkait.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {isDeleting ? 'Menghapus...' : 'Hapus'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Assignment Details */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        {assignment.judul}
                                    </CardTitle>
                                    <Badge variant={assignment.published_at ? 'default' : 'secondary'}>
                                        {assignment.published_at ? 'Dipublikasikan' : 'Draft'}
                                    </Badge>
                                </div>
                                <CardDescription>Tipe: {getTypeLabel(assignment.tipe)}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="mb-2 font-medium">Deskripsi</h4>
                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{assignment.deskripsi}</p>
                                </div>

                                {assignment.rubrik_json && assignment.rubrik_json.length > 0 && (
                                    <div>
                                        <h4 className="mb-2 font-medium">Rubrik Penilaian</h4>
                                        <div className="space-y-2">
                                            {assignment.rubrik_json.map((rubrik, index) => (
                                                <div key={index} className="rounded-lg border p-3">
                                                    <div className="mb-1 flex items-start justify-between">
                                                        <span className="text-sm font-medium">{rubrik.kriteria}</span>
                                                        <Badge variant="outline">{rubrik.bobot}%</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{rubrik.deskripsi}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Assignment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Informasi Tugas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium">Deadline</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(assignment.deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Dibuat</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(assignment.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                    </p>
                                </div>
                                {assignment.published_at && (
                                    <div>
                                        <p className="text-sm font-medium">Dipublikasikan</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(assignment.published_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Statistik
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm">Total Siswa</span>
                                    <span className="text-sm font-medium">{totalStudents}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Sudah Mengumpul</span>
                                    <span className="text-sm font-medium">{submittedCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Belum Mengumpul</span>
                                    <span className="text-sm font-medium">{totalStudents - submittedCount}</span>
                                </div>
                                {averageScore > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-sm">Rata-rata Nilai</span>
                                        <span className="text-sm font-medium">{averageScore.toFixed(1)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Submission</CardTitle>
                        <CardDescription>Status pengumpulan tugas dari siswa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIS</TableHead>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Waktu Pengumpulan</TableHead>
                                    <TableHead>Nilai</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignment.submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-mono">{submission.user.nis || '-'}</TableCell>
                                        <TableCell className="font-medium">{submission.user.name}</TableCell>
                                        <TableCell>{getStatusBadge(submission)}</TableCell>
                                        <TableCell>
                                            {submission.submitted_at ? (
                                                <div className="flex items-center gap-2">
                                                    {submission.is_late && <AlertCircle className="h-4 w-4 text-orange-500" />}
                                                    <span className="text-sm">
                                                        {format(new Date(submission.submitted_at), 'dd/MM/yyyy HH:mm', { locale: id })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {submission.score !== null ? (
                                                <span className="font-medium">{submission.score}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {submission.feedback ? (
                                                <span className="text-sm">{submission.feedback}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
