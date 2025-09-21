import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
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

interface Assignment {
    id: number;
    title: string;
    description: string;
    deadline: string;
    section_id: number;
    section: Section;
}

interface Props {
    assignment: Assignment;
    isOverdue: boolean;
}

type FormData = {
    konten_teks: string;
    file: File | null;
    link_url: string;
};

export default function Submit({ assignment, isOverdue }: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        konten_teks: '',
        file: null,
        link_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('siswa.tugas.store-submission', assignment.id), {
            forceFormData: true, // pastikan upload file OK
            preserveScroll: true,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        setData('file', file);
    };

    return (
        <AppLayout>
            <Head title={`Kumpulkan Tugas: ${assignment.title}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold text-gray-900">Kumpulkan Tugas</h1>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                        <p>
                            {assignment.section.subject.nama} - {assignment.section.guru.name}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{assignment.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: assignment.description }} />

                                    <div className="mt-6">
                                        <p className="text-sm text-gray-600">
                                            Deadline: {format(new Date(assignment.deadline), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                        {isOverdue && <p className="mt-1 text-sm text-red-600">Batas waktu pengumpulan sudah terlewat.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Form Pengumpulan</CardTitle>
                                </CardHeader>
                                <CardContent>
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
                                            <Label htmlFor="file">Unggah File</Label>
                                            <Input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                className={errors.file ? 'border-red-500' : ''}
                                            />
                                            {selectedFile && <p className="mt-1 text-sm text-gray-600">File terpilih: {selectedFile.name}</p>}
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
                                            <Button type="submit" disabled={processing || isOverdue}>
                                                {processing ? 'Mengirim...' : 'Kumpulkan Tugas'}
                                            </Button>
                                            <Button variant="outline" asChild>
                                                <Link href={route('siswa.tugas.show', assignment.id)}>Kembali</Link>
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
