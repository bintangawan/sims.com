import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
}

interface Props {
    assignment: Assignment;
    submission: Submission | null;
    canSubmit: boolean;
    isOverdue: boolean;
}

type FlashProps = { success?: string; error?: string };

export default function Show({ assignment, submission, canSubmit, isOverdue }: Props) {
    // Ketik flash agar tidak 'unknown'
    const { flash } = usePage<{ flash?: FlashProps }>().props;

    const getStatusBadge = () => {
        if (submission) return <Badge variant="secondary">Sudah Dikumpulkan</Badge>;
        if (isOverdue) return <Badge variant="destructive">Terlambat</Badge>;
        return <Badge variant="outline">Belum Dikumpulkan</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Tugas: ${assignment.judul}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">{assignment.judul}</h1>
                        {getStatusBadge()}
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                        <p>
                            {assignment.section.subject.nama} - {assignment.section.guru.name}
                        </p>
                    </div>

                    {flash?.success && <div className="mt-4 rounded-md bg-green-100 p-4 text-green-700">{flash.success}</div>}
                    {flash?.error && <div className="mt-4 rounded-md bg-red-100 p-4 text-red-700">{flash.error}</div>}

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Deskripsi Tugas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: assignment.deskripsi }} />
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium">Deadline</h3>
                                            <p className={`${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                                                {format(new Date(assignment.deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="font-medium">Status</h3>
                                            <div className="mt-1">
                                                {submission ? (
                                                    <p className="text-green-600">
                                                        Sudah dikumpulkan pada{' '}
                                                        {format(new Date(submission.submitted_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                                    </p>
                                                ) : isOverdue ? (
                                                    <p className="text-red-600">Terlambat</p>
                                                ) : (
                                                    <p className="text-gray-600">Belum dikumpulkan</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-4">
                                            {submission ? (
                                                <Button asChild>
                                                    <Link href={route('siswa.tugas.view-submission', assignment.id)}>Lihat Pengumpulan</Link>
                                                </Button>
                                            ) : canSubmit ? (
                                                <Button asChild>
                                                    <Link href={route('siswa.tugas.submit', assignment.id)}>Kumpulkan Tugas</Link>
                                                </Button>
                                            ) : isOverdue ? (
                                                <Button disabled>Batas Waktu Terlewat</Button>
                                            ) : (
                                                <Button disabled>Tidak Dapat Mengumpulkan</Button>
                                            )}

                                            <Button variant="outline" asChild>
                                                <Link href={route('siswa.tugas.index')}>Kembali ke Daftar Tugas</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
