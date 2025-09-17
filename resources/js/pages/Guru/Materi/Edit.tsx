// resources/js/pages/Guru/Materi/Edit.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Video } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    subject: Subject;
}

interface Material {
    id: number;
    judul: string;
    deskripsi: string;
    file_path: string | null;
    link_url: string | null;
    section: Section;
}

interface Props {
    material: Material;
}

interface FormData {
    judul: string;
    deskripsi: string;
    file: File | null;
    link_url: string;
    remove_file: boolean;
}

export default function Edit({ material }: Props) {
    const [removeFile, setRemoveFile] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const { data, setData, post, processing, errors, transform } = useForm<FormData>({
        judul: material.judul,
        deskripsi: material.deskripsi || '',
        file: null,
        link_url: material.link_url || '',
        remove_file: false,
    });

    transform((payload) => ({
        ...payload,
        _method: 'PUT', // spoof method untuk Laravel
    }));

    const fileExt = useMemo(() => data.file?.name.split('.').pop()?.toLowerCase() || '', [data.file]);
    const isVideo = useMemo(() => ['mp4', 'webm', 'mov', 'm4v', 'ogg'].includes(fileExt), [fileExt]);
    const isPdf = useMemo(() => fileExt === 'pdf', [fileExt]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('guru.materi.update', material.id), {
            forceFormData: true, // penting agar file terupload
            onSuccess: () => {
                router.visit(route('guru.materi.index', material.section.id));
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('file', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setRemoveFile(false);
            setData('remove_file', false);
        } else {
            setPreviewUrl('');
        }
    };

    const handleRemoveFile = (checked: boolean) => {
        setRemoveFile(checked);
        setData('remove_file', checked);
        if (checked) {
            setData('file', null);
            setPreviewUrl('');
        }
    };

    const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setData('link_url', url);
    };

    // Parser YouTube aman (tanpa regex escape berlebih)
    const getYouTubeId = (url: string): string | null => {
        try {
            const u = new URL(url);
            const host = u.hostname.replace('www.', '');
            if (host.includes('youtu.be')) {
                const id = u.pathname.slice(1);
                return id.length === 11 ? id : null;
            }
            if (host.includes('youtube.com')) {
                const v = u.searchParams.get('v');
                if (v && v.length === 11) return v;
                const parts = u.pathname.split('/');
                const embedIndex = parts.indexOf('embed');
                if (embedIndex >= 0 && parts[embedIndex + 1] && parts[embedIndex + 1].length === 11) {
                    return parts[embedIndex + 1];
                }
            }
            return null;
        } catch {
            return null;
        }
    };

    const isYouTubeLink = (url: string) => /youtu\.?be/.test(url);

    const getYouTubeEmbedUrl = (url: string) => {
        const id = getYouTubeId(url);
        return id ? `https://www.youtube.com/embed/${id}` : null;
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="h-8 w-8 text-red-500" />;
            case 'pptx':
            case 'ppt':
                return <FileText className="h-8 w-8 text-orange-500" />;
            case 'docx':
            case 'doc':
                return <FileText className="h-8 w-8 text-blue-500" />;
            case 'mp4':
            case 'webm':
            case 'mov':
            case 'm4v':
            case 'ogg':
                return <Video className="h-8 w-8 text-purple-500" />;
            default:
                return <FileText className="h-8 w-8" />;
        }
    };

    const getFileName = (filePath: string) => filePath.split('/').pop() || filePath;

    return (
        <AppLayout>
            <Head title={`Edit Materi - ${material.judul}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => router.visit(route('guru.materi.index', material.section.id))}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Materi</h1>
                        <p className="text-gray-600">
                            {material.section.subject.kode} - {material.section.subject.nama}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Materi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="judul">Judul Materi *</Label>
                                <Input
                                    id="judul"
                                    value={data.judul}
                                    onChange={(e) => setData('judul', e.target.value)}
                                    placeholder="Masukkan judul materi"
                                    className={errors.judul ? 'border-red-500' : ''}
                                />
                                {errors.judul && <p className="mt-1 text-sm text-red-500">{errors.judul}</p>}
                            </div>

                            <div>
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Masukkan deskripsi materi (opsional)"
                                    rows={3}
                                    className={errors.deskripsi ? 'border-red-500' : ''}
                                />
                                {errors.deskripsi && <p className="mt-1 text-sm text-red-500">{errors.deskripsi}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current File */}
                    {material.file_path && !removeFile && (
                        <Card>
                            <CardHeader>
                                <CardTitle>File Saat Ini</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(material.file_path)}
                                            <div>
                                                <p className="font-medium">{getFileName(material.file_path)}</p>
                                                <p className="text-sm text-gray-500">File yang sudah diupload</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="remove-file" checked={removeFile} onCheckedChange={(v) => handleRemoveFile(Boolean(v))} />
                                            <Label htmlFor="remove-file" className="text-sm text-red-600">
                                                Hapus file
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* File Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{material.file_path && !removeFile ? 'Ganti File' : 'Upload File'}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="file">File Materi</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.pptx,.ppt,.docx,.doc,.mp4,.webm,.mov,.m4v,.ogg"
                                    className={errors.file ? 'border-red-500' : ''}
                                />
                                <p className="mt-1 text-sm text-gray-500">Format yang didukung: PDF, PPTX, DOCX, MP4/WEBM/MOV (Maksimal 10MB)</p>
                                {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
                            </div>

                            {/* New File Preview */}
                            {data.file && (
                                <div className="rounded-lg border bg-green-50 p-4">
                                    <div className="flex items-center gap-3">
                                        {getFileIcon(data.file.name)}
                                        <div>
                                            <p className="font-medium">{data.file.name}</p>
                                            <p className="text-sm text-gray-500">{(data.file.size / 1024 / 1024).toFixed(2)} MB (File baru)</p>
                                        </div>
                                    </div>

                                    {previewUrl && (
                                        <div className="mt-4">
                                            {isVideo && <video src={previewUrl} controls className="h-64 w-full rounded-lg" />}
                                            {isPdf && <iframe src={previewUrl} title="PDF Preview" className="h-96 w-full rounded-lg" />}
                                            {!isVideo && !isPdf && (
                                                <div className="text-sm text-muted-foreground">Preview tidak tersedia untuk tipe ini.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Link URL */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Link URL</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="link_url">URL Materi</Label>
                                <Input
                                    id="link_url"
                                    value={data.link_url}
                                    onChange={handleLinkChange}
                                    placeholder="https://www.youtube.com/watch?v=... atau URL lainnya"
                                    className={errors.link_url ? 'border-red-500' : ''}
                                />
                                <p className="mt-1 text-sm text-gray-500">Masukkan URL YouTube atau link materi lainnya</p>
                                {errors.link_url && <p className="mt-1 text-sm text-red-500">{errors.link_url}</p>}
                            </div>

                            {/* YouTube Preview */}
                            {data.link_url && isYouTubeLink(data.link_url) && (
                                <div className="overflow-hidden rounded-lg border">
                                    <iframe
                                        src={getYouTubeEmbedUrl(data.link_url) || ''}
                                        title="YouTube Preview"
                                        className="h-64 w-full"
                                        frameBorder={0}
                                        allowFullScreen
                                    />
                                </div>
                            )}

                            {/* Non-YouTube link */}
                            {data.link_url && !isYouTubeLink(data.link_url) && (
                                <div className="rounded-lg border p-3 text-sm">
                                    <a
                                        href={data.link_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-primary underline underline-offset-4"
                                    >
                                        Buka tautan materi
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-start gap-4">
                        <Button type="button" variant="outline" onClick={() => router.visit(route('guru.materi.index', material.section.id))}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
