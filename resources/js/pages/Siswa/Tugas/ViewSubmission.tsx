import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, PageProps, useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useState } from 'react';

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

interface Props extends PageProps {
    assignment: Assignment;
    submission: Submission;
    canEdit: boolean;
}

type FlashProps = { success?: string; error?: string };
type FormData = {
    konten_teks: string;
    file: File | null;
    link_url: string;
};

export default function ViewSubmission({ assignment, submission, canEdit }: Props) {
    // ✅ tipkan flash agar tidak 'unknown'
    const { flash } = usePage<{ flash?: FlashProps }>().props;

    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // ✅ ambil errors dari useForm (bukan dari usePage)
    const { data, setData, post, processing, errors } = useForm<FormData>({
        konten_teks: submission.konten_teks || '',
        file: null,
        link_url: submission.link_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('siswa.tugas.update-submission', assignment.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        setData('file', file);
    };

    const getScoreBadge = () => {
        if (submission.score !== null) {
            return <Badge variant={submission.score >= 70 ? 'secondary' : 'destructive'}>Nilai: {submission.score}</Badge>;
        }
        return <Badge variant="outline">Belum Dinilai</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Pengumpulan Tugas: ${assignment.judul}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">Pengumpulan Tugas</h1>
                        {getScoreBadge()}
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
                                    <CardTitle>{assignment.judul}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: assignment.deskripsi }} />

                                    <div className="mt-6">
                                        <p className="text-sm text-gray-600">
                                            Deadline:{' '}
                                            {format(new Date(assignment.deadline), 'dd MMMM yyyy, HH:mm', {
                                                locale: id,
                                            })}
                                        </p>
                                        <p className="mt-1 text-sm text-green-600">
                                            Dikumpulkan pada:{' '}
                                            {format(new Date(submission.submitted_at), 'dd MMMM yyyy, HH:mm', {
                                                locale: id,
                                            })}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Jawaban Anda</CardTitle>
                                        {canEdit && !isEditing && (
                                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <Label htmlFor="konten_teks">Jawaban Teks</Label>
                                                <Textarea
                                                    id="konten_teks"
                                                    value={data.konten_teks}
                                                    onChange={(e) => setData('konten_teks', e.target.value)}
                                                    placeholder="Tulis jawaban Anda di sini..."
                                                    rows={5}
                                                    className={errors.konten_teks ? 'border-red-500' : ''}
                                                />
                                                {errors.konten_teks && <p className="mt-1 text-sm text-red-500">{errors.konten_teks}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="file">Unggah File Baru</Label>
                                                <Input
                                                    id="file"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className={errors.file ? 'border-red-500' : ''}
                                                />
                                                {selectedFile && <p className="mt-1 text-sm text-gray-600">File baru: {selectedFile.name}</p>}
                                                {submission.file_path && !selectedFile && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        File saat ini: {submission.file_path.split('/').pop()}
                                                    </p>
                                                )}
                                                {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format yang didukung: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, ZIP, RAR (Maks. 10MB)
                                                </p>
                                            </div>

                                            <div>
                                                <Label htmlFor="link_url">Link URL</Label>
                                                <Input
                                                    id="link_url"
                                                    type="url"
                                                    value={data.link_url}
                                                    onChange={(e) => setData('link_url', e.target.value)}
                                                    placeholder="https://example.com/tugas-saya"
                                                    className={errors.link_url ? 'border-red-500' : ''}
                                                />
                                                {errors.link_url && <p className="mt-1 text-sm text-red-500">{errors.link_url}</p>}
                                            </div>

                                            <div className="flex flex-col gap-2 pt-4">
                                                <Button type="submit" disabled={processing}>
                                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                                </Button>
                                                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                                                    Batal
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            {submission.konten_teks && (
                                                <div>
                                                    <h3 className="mb-2 font-medium">Jawaban Teks:</h3>
                                                    <div className="rounded-md bg-gray-50 p-3 whitespace-pre-wrap">{submission.konten_teks}</div>
                                                </div>
                                            )}

                                            {submission.file_path && (
                                                <div>
                                                    <h3 className="mb-2 font-medium">File:</h3>
                                                    <Button asChild variant="outline" size="sm">
                                                        <a href={`/storage/${submission.file_path}`} target="_blank" rel="noopener noreferrer">
                                                            Lihat File
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}

                                            {submission.link_url && (
                                                <div>
                                                    <h3 className="mb-2 font-medium">Link URL:</h3>
                                                    <Button asChild variant="outline" size="sm">
                                                        <a href={submission.link_url} target="_blank" rel="noopener noreferrer">
                                                            Buka Link
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}

                                            {submission.score !== null && (
                                                <div>
                                                    <h3 className="mb-2 font-medium">Nilai:</h3>
                                                    <p className="text-lg font-bold">{submission.score}</p>
                                                </div>
                                            )}

                                            {submission.feedback && (
                                                <div>
                                                    <h3 className="mb-2 font-medium">Feedback Guru:</h3>
                                                    <div className="rounded-md bg-gray-50 p-3 whitespace-pre-wrap">{submission.feedback}</div>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <Button variant="outline" asChild>
                                                    <Link href={route('siswa.tugas.show', assignment.id)}>Kembali ke Detail Tugas</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
