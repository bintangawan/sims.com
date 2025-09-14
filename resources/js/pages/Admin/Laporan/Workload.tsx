import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Download, Filter, GraduationCap, RotateCcw, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface WorkloadData {
    id: number;
    name: string;
    email: string;
    total_sections: number | string; // bisa datang sebagai string dari backend
    total_students: number | string; // bisa datang sebagai string dari backend
    total_subjects: number | string; // bisa datang sebagai string dari backend
}

interface Term {
    id: number;
    nama: string;
    tahun: string;
    aktif: boolean;
}

interface Filters {
    term_id?: string;
}

interface PaginatedWorkloadData {
    data: WorkloadData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    workloadData: PaginatedWorkloadData;
    terms: Term[];
    filters: Filters;
}

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
const n = (v: unknown) => Number(v ?? 0) || 0;

const buildPayload = (f: Filters): Record<string, string> => {
    const out: Record<string, string> = {};
    if (f.term_id) out.term_id = f.term_id;
    return out;
};

// Dialog Export (mirip yang di Attendance/Grades)
function ExportWorkloadDialog({
    open,
    onOpenChange,
    terms,
    initial,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    terms: Term[];
    initial: Filters;
}) {
    const [form, setForm] = useState<Filters>({
        term_id: initial.term_id ?? '',
    });

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams(buildPayload(form)).toString();
        return params ? `/admin/laporan/export/workload?${params}` : `/admin/laporan/export/workload`;
    }, [form]);

    const download = () => {
        toast.info('Menyiapkan file Excel...');
        window.open(exportUrl, '_blank', 'noopener');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Laporan Beban Kerja
                    </DialogTitle>
                    <DialogDescription>
                        Pilih kriteria export. File akan diunduh dalam format <b>.xlsx</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Term */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <label className="text-right text-sm">Term</label>
                        <div className="col-span-3">
                            <Select value={form.term_id ?? ''} onValueChange={(v) => setForm((p) => ({ ...p, term_id: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Term" />
                                </SelectTrigger>
                                <SelectContent>
                                    {terms.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.nama} ({t.tahun})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                        URL: <span className="font-mono break-all text-foreground">{exportUrl}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={download}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ────────────────────────────────────────────────────────────────────────────────

const Workload: React.FC<Props> = ({ workloadData, terms, filters }) => {
    const [formData, setFormData] = useState<Filters>({
        term_id: filters.term_id || '',
    });
    const [openExport, setOpenExport] = useState(false);

    const handleFilter = () => {
        const params = buildPayload(formData);
        router.get('/admin/laporan/workload', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setFormData({ term_id: '' });
        router.get('/admin/laporan/workload', {}, { preserveState: true, preserveScroll: true });
    };

    const getWorkloadBadge = (totalSections: number | string) => {
        const v = n(totalSections);
        if (v >= 8) return <Badge className="bg-red-500">Tinggi</Badge>;
        if (v >= 5) return <Badge className="bg-yellow-500">Sedang</Badge>;
        if (v >= 1) return <Badge className="bg-green-500">Rendah</Badge>;
        return <Badge className="bg-gray-500">Tidak Ada</Badge>;
    };

    const handlePageChange = (url: string) => {
        if (!url) return;
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page');
        const params = { ...buildPayload(formData), page };
        router.get('/admin/laporan/workload', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Statistik (konversi ke number dulu)
    const totalTeachers = workloadData.data.length;
    const totalSections = workloadData.data.reduce((sum, t) => sum + n(t.total_sections), 0);
    const totalStudents = workloadData.data.reduce((sum, t) => sum + n(t.total_students), 0);
    const avgSectionsPerTeacher = totalTeachers > 0 ? (totalSections / totalTeachers).toFixed(1) : '0';

    return (
        <AppLayout>
            <Head title="Laporan Beban Kerja Guru" />

            {/* Padding biar ga mepet sidebar (seragam dg Dashboard) */}
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/laporan">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Laporan Beban Kerja Guru</h1>
                            <p className="text-muted-foreground">Analisis data beban kerja guru</p>
                        </div>
                    </div>

                    {/* Buka dialog export */}
                    <Button onClick={() => setOpenExport(true)} className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export Excel</span>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <Users className="h-4 w-4" />
                                Total Guru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTeachers.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <BookOpen className="h-4 w-4" />
                                Total Kelas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSections.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <GraduationCap className="h-4 w-4" />
                                Total Siswa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStudents.toLocaleString('id-ID')}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Kelas/Guru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgSectionsPerTeacher}</div>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Term</label>
                                <Select value={formData.term_id} onValueChange={(value) => setFormData((prev) => ({ ...prev, term_id: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Term" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {terms.map((term) => (
                                            <SelectItem key={term.id} value={term.id.toString()}>
                                                {term.nama} ({term.tahun})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        <CardTitle>Data Beban Kerja Guru</CardTitle>
                        <p className="text-sm text-gray-600">
                            Menampilkan {workloadData.from || 0} - {workloadData.to || 0} dari {workloadData.total || 0} guru
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-3 text-left font-medium">Nama Guru</th>
                                        <th className="p-3 text-left font-medium">Email</th>
                                        <th className="p-3 text-left font-medium">Jumlah Kelas</th>
                                        <th className="p-3 text-left font-medium">Jumlah Siswa</th>
                                        <th className="p-3 text-left font-medium">Mata Pelajaran</th>
                                        <th className="p-3 text-left font-medium">Beban Kerja</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workloadData.data.length > 0 ? (
                                        workloadData.data.map((teacher) => (
                                            <tr key={teacher.id} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{teacher.name}</td>
                                                <td className="p-3 text-gray-600">{teacher.email}</td>
                                                <td className="p-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                                                        {n(teacher.total_sections).toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
                                                        {n(teacher.total_students).toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-800">
                                                        {n(teacher.total_subjects).toLocaleString('id-ID')}
                                                    </span>
                                                </td>
                                                <td className="p-3">{getWorkloadBadge(teacher.total_sections)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                                Tidak ada data beban kerja yang ditemukan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {workloadData.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Halaman {workloadData.current_page} dari {workloadData.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {workloadData.links.map((link, index) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button
                                                    key={index}
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
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && handlePageChange(link.url)}
                                                >
                                                    Selanjutnya
                                                </Button>
                                            );
                                        }
                                        if (!isNaN(Number(link.label))) {
                                            return (
                                                <Button
                                                    key={index}
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

            {/* Dialog Export */}
            <ExportWorkloadDialog open={openExport} onOpenChange={setOpenExport} terms={terms} initial={formData} />
        </AppLayout>
    );
};

export default Workload;
