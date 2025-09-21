// resources/js/pages/Guru/Penilaian/Grade.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Download, ExternalLink, FileText, Link as LinkIcon, Save, User } from 'lucide-react';
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

interface UserType {
    id: number;
    name: string;
    nis?: string;
}

interface Submission {
    id: number;
    user: UserType;
    assignment: Assignment;
    konten_teks?: string;
    file_path?: string;
    link_url?: string;
    submitted_at: string;
    score?: number;
    feedback?: string;
    is_late: boolean;
}

interface Props {
    submission: Submission;
}

interface FormData {
    score: number | string;
    feedback: string;
}

type BreadcrumbItemType = {
    title: string;
    href: string;
};

export default function Grade({ submission }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        score: submission.score || '',
        feedback: submission.feedback || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('guru.penilaian.update', submission.id), {
            onSuccess: () => {
                toast.success('Penilaian berhasil disimpan');
                // gunakan reset agar lint “unused vars” hilang dan form kembali ke nilai awal
                reset('score', 'feedback');
            },
            onError: () => {
                toast.error('Gagal menyimpan penilaian');
            },
        });
    };

    const handleDownloadFile = () => {
        if (submission.file_path) {
            window.open(`/storage/${submission.file_path}`, '_blank');
        }
    };

    const getScoreBadge = (score?: number) => {
        if (score === null || score === undefined) {
            return <Badge variant="secondary">Belum Dinilai</Badge>;
        }
        if (score >= 80) return <Badge className="bg-green-100 text-green-800">A ({score})</Badge>;
        if (score >= 70) return <Badge className="bg-blue-100 text-blue-800">B ({score})</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">C ({score})</Badge>;
        return <Badge className="bg-red-100 text-red-800">D ({score})</Badge>;
    };

    const getSubmissionContent = () => {
        if (submission.file_path) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">File Submission</span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">File yang diupload:</p>
                                <p className="font-medium">{submission.file_path.split('/').pop()}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownloadFile}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            );
        } else if (submission.link_url) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Link Submission</span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">URL:</p>
                                <p className="font-medium break-all">{submission.link_url}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a href={submission.link_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Buka
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        } else if (submission.konten_teks) {
            return (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Teks Submission</span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="text-sm whitespace-pre-wrap">{submission.konten_teks}</div>
                    </div>
                </div>
            );
        }

        return <div className="py-8 text-center text-gray-500">Tidak ada konten submission</div>;
    };

    // breadcrumbs di header AppLayout (sejajar toggle sidebar)
    const breadcrumbs: BreadcrumbItemType[] = [
        { title: 'Dashboard', href: '/guru/dashboard' },
        { title: 'Kelas', href: '/guru/kelas' },
        {
            title: submission.assignment.section.subject.nama,
            href: `/guru/kelas/${submission.assignment.section.id}`,
        },
        {
            title: 'Penilaian',
            href: route('guru.penilaian.submissions', submission.assignment.id),
        },
        {
            title: 'Nilai',
            href: route('guru.penilaian.show', submission.id), // ← tambahkan ini
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Penilaian - ${submission.user.name}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('guru.penilaian.submissions', submission.assignment.id)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Penilaian Submission</h1>
                            <p className="text-gray-600">
                                {submission.assignment.judul} - {submission.assignment.section.subject.nama}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {submission.is_late && <Badge variant="destructive">Terlambat</Badge>}
                        {getScoreBadge(submission.score)}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Student Info & Submission Content */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Student Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informasi Siswa
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Nama</Label>
                                        <p className="text-lg font-semibold">{submission.user.name}</p>
                                    </div>
                                    {submission.user.nis && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">NIS</Label>
                                            <p className="text-lg font-semibold">{submission.user.nis}</p>
                                        </div>
                                    )}
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Waktu Submit</Label>
                                        <p className="text-lg font-semibold">
                                            {format(new Date(submission.submitted_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                                        <div className="mt-1">
                                            {submission.is_late ? (
                                                <Badge variant="destructive">Terlambat</Badge>
                                            ) : (
                                                <Badge variant="default">Tepat Waktu</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assignment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Tugas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Judul</Label>
                                        <p className="text-lg font-semibold">{submission.assignment.judul}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Deskripsi</Label>
                                        <p className="text-sm whitespace-pre-wrap text-gray-700">{submission.assignment.deskripsi}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Deadline</Label>
                                        <p className="text-sm font-medium">
                                            {format(new Date(submission.assignment.deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submission Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Konten Submission</CardTitle>
                            </CardHeader>
                            <CardContent>{getSubmissionContent()}</CardContent>
                        </Card>
                    </div>

                    {/* Grading Form */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Form Penilaian</CardTitle>
                                <CardDescription>Berikan nilai dan feedback untuk submission ini</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="score">Nilai (0-100)</Label>
                                        <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={data.score}
                                            onChange={(e) => setData('score', e.target.value)}
                                            placeholder="Masukkan nilai..."
                                            className={errors.score ? 'border-red-500' : ''}
                                        />
                                        {errors.score && <p className="mt-1 text-sm text-red-600">{errors.score}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="feedback">Feedback</Label>
                                        <Textarea
                                            id="feedback"
                                            value={data.feedback}
                                            onChange={(e) => setData('feedback', e.target.value)}
                                            placeholder="Berikan feedback untuk siswa..."
                                            rows={6}
                                            className={errors.feedback ? 'border-red-500' : ''}
                                        />
                                        {errors.feedback && <p className="mt-1 text-sm text-red-600">{errors.feedback}</p>}
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan Penilaian'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Current Grade Display */}
                        {submission.score !== undefined && submission.score !== null && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Nilai Saat Ini</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-center">
                                        <div className="text-3xl font-bold text-blue-600">{submission.score}</div>
                                        <div>{getScoreBadge(submission.score)}</div>
                                        {submission.feedback && (
                                            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left">
                                                <Label className="text-sm font-medium text-gray-600">Feedback:</Label>
                                                <p className="mt-1 text-sm whitespace-pre-wrap text-gray-700">{submission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
