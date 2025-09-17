import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BookOpen, Edit, Eye, FileText, Link, Plus, Search, Trash2, Video } from 'lucide-react';
import { useState } from 'react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    subject: Subject;
    kapasitas?: number;
    capacity?: number;
}

interface Material {
    id: number;
    judul: string;
    deskripsi: string;
    file_path: string | null;
    link_url: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    section: Section;
    materials: Material[];
}

export default function Index({ section, materials }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'file' | 'link'>('all');

    const handleCreateMaterial = () => {
        router.visit(route('guru.materi.create', { section: section.id, section_id: section.id }));
    };

    const handleViewMaterial = (materialId: number) => {
        router.visit(route('guru.materi.show', materialId));
    };

    const handleEditMaterial = (materialId: number) => {
        router.visit(route('guru.materi.edit', materialId));
    };

    const handleDeleteMaterial = (materialId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus materi ini?')) {
            router.delete(route('guru.materi.destroy', materialId));
        }
    };

    const getFileIcon = (filePath: string | null) => {
        if (!filePath) return <FileText className="h-4 w-4" />;

        const extension = filePath.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="h-4 w-4 text-red-500" />;
            case 'pptx':
            case 'ppt':
                return <FileText className="h-4 w-4 text-orange-500" />;
            case 'docx':
            case 'doc':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'mp4':
            case 'avi':
            case 'mov':
                return <Video className="h-4 w-4 text-purple-500" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const isYouTubeLink = (url: string | null) => {
        if (!url) return false;
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const filteredMaterials = materials.filter((material) => {
        const matchesSearch =
            material.judul.toLowerCase().includes(searchTerm.toLowerCase()) || material.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'all' || (filterType === 'file' && material.file_path) || (filterType === 'link' && material.link_url);

        return matchesSearch && matchesFilter;
    });

    return (
        <AppLayout>
            <Head title={`Materi - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Materi Pembelajaran</h1>
                        <p className="text-gray-600">
                            {section.subject.kode} - {section.subject.nama}
                        </p>
                    </div>
                    <Button onClick={handleCreateMaterial}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Materi
                    </Button>
                </div>

                {/* Search and Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                <Input
                                    placeholder="Cari materi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>
                                    Semua
                                </Button>
                                <Button variant={filterType === 'file' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('file')}>
                                    File
                                </Button>
                                <Button variant={filterType === 'link' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('link')}>
                                    Link
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Materials List */}
                <div className="grid gap-4">
                    {filteredMaterials.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="py-8 text-center">
                                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                                        {searchTerm || filterType !== 'all' ? 'Tidak ada materi yang ditemukan' : 'Belum ada materi'}
                                    </h3>
                                    <p className="mb-4 text-gray-600">
                                        {searchTerm || filterType !== 'all'
                                            ? 'Coba ubah kata kunci pencarian atau filter'
                                            : 'Mulai tambahkan materi pembelajaran untuk kelas ini'}
                                    </p>
                                    {!searchTerm && filterType === 'all' && (
                                        <Button onClick={handleCreateMaterial}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Materi Pertama
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredMaterials.map((material) => (
                            <Card key={material.id} className="transition-shadow hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="mb-2 text-lg">{material.judul}</CardTitle>
                                            {material.deskripsi && <p className="line-clamp-2 text-sm text-gray-600">{material.deskripsi}</p>}
                                        </div>
                                        <div className="ml-4 flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleViewMaterial(material.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleEditMaterial(material.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteMaterial(material.id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {material.file_path && (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    {getFileIcon(material.file_path)}
                                                    File
                                                </Badge>
                                            )}
                                            {material.link_url && (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    {isYouTubeLink(material.link_url) ? (
                                                        <Video className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <Link className="h-4 w-4" />
                                                    )}
                                                    {isYouTubeLink(material.link_url) ? 'YouTube' : 'Link'}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {format(new Date(material.created_at), 'dd MMM yyyy', { locale: id })}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
