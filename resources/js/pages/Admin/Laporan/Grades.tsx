import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, Filter, RotateCcw } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface GradeData {
    student_name: string;
    subject_name: string;
    assignment_title: string;
    score: number;
    created_at: string;
}

interface GradeStats {
    avg_score: number;
    min_score: number;
    max_score: number;
}

interface Section {
    id: number;
    subject: {
        id: number;
        nama: string;
    };
}

interface Term {
    id: number;
    nama: string;
    tahun: string;
    aktif: boolean;
}

// ✅ Tambah tipe link untuk pagination Laravel
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: GradeData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    // ✅ Tambahkan properti links agar dikenal TS
    links?: PaginationLink[];
}

interface Filters {
    term_id?: string;
    section_id?: string;
    min_score?: string;
    max_score?: string;
}

interface Props {
    gradesData: PaginatedData;
    gradeStats: GradeStats;
    sections: Section[];
    terms: Term[];
    filters: Filters;
}

// Form state internal—semua string
type FiltersForm = {
    term_id: string;
    section_id: string;
    min_score: string;
    max_score: string;
};

const Grades: React.FC<Props> = ({ gradesData, gradeStats, sections, terms, filters }) => {
    const [formData, setFormData] = useState<FiltersForm>({
        term_id: filters.term_id ?? '',
        section_id: filters.section_id ?? '',
        min_score: filters.min_score ?? '',
        max_score: filters.max_score ?? '',
    });

    // Utility: hanya kirim field yang tidak kosong ke Inertia
    const buildPayload = (f: FiltersForm): Record<string, string> => {
        const out: Record<string, string> = {};
        if (f.term_id) out.term_id = f.term_id;
        if (f.section_id) out.section_id = f.section_id;
        if (f.min_score) out.min_score = f.min_score;
        if (f.max_score) out.max_score = f.max_score;
        return out;
    };

    const handleFilter = () => {
        router.get('/admin/laporan/grades', buildPayload(formData), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const cleared: FiltersForm = { term_id: '', section_id: '', min_score: '', max_score: '' };
        setFormData(cleared);
        router.get('/admin/laporan/grades', {}, { preserveState: true, preserveScroll: true });
    };

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams(buildPayload(formData)).toString();
        return params ? `/admin/laporan/export/grades?${params}` : `/admin/laporan/export/grades`;
    }, [formData]);

    const handleExport = () => {
        window.open(exportUrl, '_blank');
    };

    const getScoreBadge = (score: number) => {
        if (score >= 85) return <Badge className="bg-green-500">Sangat Baik</Badge>;
        if (score >= 70) return <Badge className="bg-blue-500">Baik</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-500">Cukup</Badge>;
        return <Badge className="bg-red-500">Kurang</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handlePageChange = (url: string) => {
        if (!url) return;
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page') || '1';
        const params = { ...buildPayload(formData), page };
        router.get('/admin/laporan/grades', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Laporan Nilai" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <Link href="/admin/laporan">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Laporan Nilai</h1>
                            <p className="text-muted-foreground">Analisis data nilai siswa</p>
                        </div>
                    </div>
                    <Button onClick={handleExport} className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Nilai Rata-rata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{gradeStats?.avg_score?.toFixed(2) || '0'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Nilai Tertinggi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{gradeStats?.max_score ?? '0'}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Nilai Terendah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{gradeStats?.min_score ?? '0'}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Term</label>
                                <Select value={formData.term_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, term_id: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {terms.map((term) => (
                                            <SelectItem key={term.id} value={String(term.id)}>
                                                {term.nama} ({term.tahun})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Mata Pelajaran</label>
                                <Select
                                    value={formData.section_id}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, section_id: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Mata Pelajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)}>
                                                {section.subject.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Nilai Minimum</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    min={0}
                                    max={100}
                                    value={formData.min_score}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, min_score: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Nilai Maksimum</label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    min={0}
                                    max={100}
                                    value={formData.max_score}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, max_score: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button onClick={handleFilter} className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Terapkan Filter
                            </Button>
                            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Nilai Siswa</CardTitle>
                        <p className="text-sm text-gray-600">
                            Menampilkan {gradesData.from || 0} - {gradesData.to || 0} dari {gradesData.total || 0} data
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-medium">Nama Siswa</th>
                                        <th className="p-3 text-left font-medium">Mata Pelajaran</th>
                                        <th className="p-3 text-left font-medium">Tugas</th>
                                        <th className="p-3 text-left font-medium">Nilai</th>
                                        <th className="p-3 text-left font-medium">Kategori</th>
                                        <th className="p-3 text-left font-medium">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gradesData.data.length > 0 ? (
                                        gradesData.data.map((grade, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-3">{grade.student_name}</td>
                                                <td className="p-3">{grade.subject_name}</td>
                                                <td className="p-3">{grade.assignment_title}</td>
                                                <td className="p-3 font-semibold">{grade.score}</td>
                                                <td className="p-3">{getScoreBadge(grade.score)}</td>
                                                <td className="p-3">{formatDate(grade.created_at)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                                Tidak ada data nilai yang ditemukan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {gradesData.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Halaman {gradesData.current_page} dari {gradesData.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {(gradesData.links ?? []).map((link: PaginationLink, index: number) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button
                                                    key={`prev-${index}`}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                >
                                                    Sebelumnya
                                                </Button>
                                            );
                                        }
                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Button
                                                    key={`next-${index}`}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                >
                                                    Selanjutnya
                                                </Button>
                                            );
                                        }
                                        // halaman angka
                                        const isNumber = !Number.isNaN(Number(link.label));
                                        if (isNumber) {
                                            return (
                                                <Button
                                                    key={`page-${index}`}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                >
                                                    {link.label}
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Grades;
