import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Download, Edit, ExternalLink, FileText, Link, Trash2, Video } from 'lucide-react';

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
    created_at: string;
    updated_at: string;
    section: Section;
}

interface Props {
    material: Material;
}

export default function Show({ material }: Props) {
    const handleEdit = () => {
        router.visit(route('guru.materi.edit', material.id));
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
            router.delete(route('guru.materi.destroy', material.id), {
                onSuccess: () => {
                    router.visit(route('guru.materi.index', material.section.id));
                },
            });
        }
    };

    const handleDownload = () => {
        if (material.file_path) {
            window.location.href = route('guru.materi.download', material.id);
        }
    };

    const getYouTubeEmbedUrl = (url: string) => {
        // Hilangkan escape yang tidak perlu di dalam character class, dan escape '.' pada youtu.be
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const isYouTubeLink = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getFileIcon = (filePath: string) => {
        const extension = filePath.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="h-6 w-6 text-red-500" />;
            case 'pptx':
            case 'ppt':
                return <FileText className="h-6 w-6 text-orange-500" />;
            case 'docx':
            case 'doc':
                return <FileText className="h-6 w-6 text-blue-500" />;
            case 'mp4':
            case 'avi':
            case 'mov':
                return <Video className="h-6 w-6 text-purple-500" />;
            default:
                return <FileText className="h-6 w-6" />;
        }
    };

    const getFileName = (filePath: string) => {
        return filePath.split('/').pop() || filePath;
    };

    const renderFilePreview = () => {
        if (!material.file_path) return null;

        const extension = material.file_path.split('.').pop()?.toLowerCase();
        const fileUrl = route('guru.materi.preview', material.id);

        switch (extension) {
            case 'pdf':
                return (
                    <div className="overflow-hidden rounded-lg border">
                        <iframe src={fileUrl} title="PDF Preview" className="h-96 w-full" frameBorder="0" />
                    </div>
                );
            case 'mp4':
                return (
                    <div className="overflow-hidden rounded-lg border">
                        <video controls className="h-auto w-full" preload="metadata">
                            <source src={fileUrl} type="video/mp4" />
                            Browser Anda tidak mendukung video HTML5.
                        </video>
                    </div>
                );
            case 'pptx':
            case 'ppt':
            case 'docx':
            case 'doc':
                return (
                    <div className="rounded-lg border bg-gray-50 p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            {getFileIcon(material.file_path)}
                            <div>
                                <p className="text-lg font-medium">{getFileName(material.file_path)}</p>
                                <p className="text-gray-600">Preview tidak tersedia untuk format ini</p>
                            </div>
                            <Button onClick={handleDownload} className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download File
                            </Button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="rounded-lg border bg-gray-50 p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                            {getFileIcon(material.file_path)}
                            <div>
                                <p className="text-lg font-medium">{getFileName(material.file_path)}</p>
                                <p className="text-gray-600">Format file tidak dikenali</p>
                            </div>
                            <Button onClick={handleDownload} className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download File
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <AppLayout>
            <Head title={material.judul} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => router.visit(route('guru.materi.index', material.section.id))}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{material.judul}</h1>
                            <p className="text-gray-600">
                                {material.section.subject.kode} - {material.section.subject.nama}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleEdit}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                {/* Material Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Materi</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {material.deskripsi && (
                            <div>
                                <h3 className="mb-2 font-medium">Deskripsi</h3>
                                <p className="whitespace-pre-wrap text-gray-700">{material.deskripsi}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            {material.file_path && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {getFileIcon(material.file_path)}
                                    File: {getFileName(material.file_path)}
                                </Badge>
                            )}
                            {material.link_url && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {isYouTubeLink(material.link_url) ? <Video className="h-4 w-4 text-red-500" /> : <Link className="h-4 w-4" />}
                                    {isYouTubeLink(material.link_url) ? 'YouTube' : 'Link'}
                                </Badge>
                            )}
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>Dibuat: {format(new Date(material.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                            {material.updated_at !== material.created_at && (
                                <p>Diperbarui: {format(new Date(material.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* File Preview */}
                {material.file_path && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Preview File</CardTitle>
                                <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>{renderFilePreview()}</CardContent>
                    </Card>
                )}

                {/* Link Preview */}
                {material.link_url && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{isYouTubeLink(material.link_url) ? 'Video YouTube' : 'Link Eksternal'}</CardTitle>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(material.link_url!, '_blank')}
                                    className="flex items-center gap-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Buka Link
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isYouTubeLink(material.link_url) ? (
                                <div className="overflow-hidden rounded-lg border">
                                    <iframe
                                        src={getYouTubeEmbedUrl(material.link_url) || ''}
                                        title="YouTube Video"
                                        className="h-96 w-full"
                                        frameBorder="0"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="rounded-lg border bg-gray-50 p-6 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Link className="h-12 w-12 text-gray-400" />
                                        <div>
                                            <p className="text-lg font-medium">Link Eksternal</p>
                                            <p className="break-all text-gray-600">{material.link_url}</p>
                                        </div>
                                        <Button onClick={() => window.open(material.link_url!, '_blank')} className="flex items-center gap-2">
                                            <ExternalLink className="h-4 w-4" />
                                            Buka Link
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
