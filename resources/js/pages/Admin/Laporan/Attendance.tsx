import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────────────────────────────
// Sentinel value untuk "Semua Kelas" (hindari value="" pada SelectItem)
const SECTION_ALL = 'all';

// Types
interface AttendanceData {
    status: string;
    count: number;
    student_name: string;
    subject_name: string;
}

interface Section {
    id: number;
    subject: { id: number; nama: string };
}

interface Term {
    id: number;
    nama: string;
    tahun: string;
    aktif: boolean;
}

interface Filters {
    term_id?: number;
    section_id?: number;
    start_date?: string;
    end_date?: string;
}

interface PaginatedAttendanceData {
    data: AttendanceData[];
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
    attendanceData: PaginatedAttendanceData;
    sections: Section[];
    terms: Term[];
    filters: Filters;
}

interface GroupedAttendanceItem {
    student_name: string;
    subject_name: string;
    statuses: Record<string, number>;
}

type FilterForm = {
    term_id: string; // '' atau id string
    section_id: string; // SECTION_ALL atau id string
    start_date: string;
    end_date: string;
};

// ────────────────────────────────────────────────────────────────────────────────
// Util untuk payload aman Inertia/URLSearchParams
const buildPayload = (f: FilterForm): Record<string, string> => {
    const out: Record<string, string> = {};
    if (f.term_id) out.term_id = f.term_id;
    if (f.section_id !== SECTION_ALL) out.section_id = f.section_id;
    if (f.start_date) out.start_date = f.start_date;
    if (f.end_date) out.end_date = f.end_date;
    return out;
};

// ────────────────────────────────────────────────────────────────────────────────
// Dialog Export (ala Users/Index.tsx, disesuaikan konteks Absensi)
function ExportAttendanceDialog({
    open,
    onOpenChange,
    terms,
    sections,
    initial,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    terms: Term[];
    sections: Section[];
    initial: FilterForm;
}) {
    const [roleLikeForm, setForm] = useState<FilterForm>(initial);

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams(buildPayload(roleLikeForm)).toString();
        return params ? `/admin/laporan/export/attendance?${params}` : `/admin/laporan/export/attendance`;
    }, [roleLikeForm]);

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
                        Export Laporan Absensi
                    </DialogTitle>
                    <DialogDescription>
                        Pilih kriteria export. File akan diunduh dalam format <b>.xlsx</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    {/* Term */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right">Periode</Label>
                        <div className="col-span-3">
                            <Select value={roleLikeForm.term_id} onValueChange={(v) => setForm((p) => ({ ...p, term_id: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih periode" />
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

                    {/* Section */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right">Kelas</Label>
                        <div className="col-span-3">
                            <Select value={roleLikeForm.section_id} onValueChange={(v) => setForm((p) => ({ ...p, section_id: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={SECTION_ALL}>Semua kelas</SelectItem>
                                    {sections.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.subject.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date range */}
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right">Tanggal</Label>
                        <div className="col-span-3 grid grid-cols-2 gap-2">
                            <Input
                                type="date"
                                value={roleLikeForm.start_date}
                                onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                            />
                            <Input type="date" value={roleLikeForm.end_date} onChange={(e) => setForm((p) => ({ ...p, end_date: e.target.value }))} />
                        </div>
                    </div>

                    {/* URL preview */}
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
export default function AttendanceReport({ attendanceData, sections, terms, filters }: Props) {
    // normalisasi filter awal -> string
    const [formData, setFormData] = useState<FilterForm>({
        term_id: filters.term_id ? String(filters.term_id) : '',
        section_id: filters.section_id ? String(filters.section_id) : SECTION_ALL,
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
    });

    const [openExport, setOpenExport] = useState(false);

    const handleFilter = () => {
        router.get('/admin/laporan/attendance', buildPayload(formData), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (url: string) => {
        if (!url) return;
        const urlObj = new URL(url);
        const page = urlObj.searchParams.get('page');
        const params = { ...buildPayload(formData), page: page ?? '' };
        router.get('/admin/laporan/attendance', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Group attendance data by student + subject
    const groupedData = attendanceData.data.reduce(
        (acc, item) => {
            const key = `${item.student_name}-${item.subject_name}`;
            if (!acc[key]) {
                acc[key] = {
                    student_name: item.student_name,
                    subject_name: item.subject_name,
                    statuses: {},
                };
            }
            acc[key].statuses[item.status] = item.count;
            return acc;
        },
        {} as Record<string, GroupedAttendanceItem>,
    );

    return (
        <AppLayout>
            <Head title="Laporan Absensi" />

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
                            <h1 className="text-3xl font-bold tracking-tight">Laporan Absensi</h1>
                            <p className="text-muted-foreground">Analisis data kehadiran siswa</p>
                        </div>
                    </div>

                    {/* tombol buka dialog export */}
                    <Button onClick={() => setOpenExport(true)} className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export Excel</span>
                    </Button>
                </div>

                {/* Filters (on-page) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Filter className="h-5 w-5" />
                            <span>Filter Laporan</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Term */}
                            <div className="space-y-2">
                                <Label htmlFor="term_id">Periode</Label>
                                <Select value={formData.term_id} onValueChange={(value) => setFormData({ ...formData, term_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih periode" />
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

                            {/* Section */}
                            <div className="space-y-2">
                                <Label htmlFor="section_id">Kelas</Label>
                                <Select value={formData.section_id} onValueChange={(value) => setFormData({ ...formData, section_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={SECTION_ALL}>Semua kelas</SelectItem>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)}>
                                                {section.subject.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start_date">Tanggal Mulai</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">Tanggal Selesai</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button onClick={handleFilter}>Terapkan Filter</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Data Absensi</CardTitle>
                        <CardDescription>
                            Menampilkan {attendanceData.from || 0} - {attendanceData.to || 0} dari {attendanceData.total || 0} data absensi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Siswa</TableHead>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead className="text-center">Hadir</TableHead>
                                        <TableHead className="text-center">Tidak Hadir</TableHead>
                                        <TableHead className="text-center">Izin</TableHead>
                                        <TableHead className="text-center">Sakit</TableHead>
                                        <TableHead className="text-center">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.values(groupedData).map((item: GroupedAttendanceItem, idx) => {
                                        const total = Object.values(item.statuses).reduce((sum, n) => sum + n, 0);
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{item.student_name}</TableCell>
                                                <TableCell>{item.subject_name}</TableCell>
                                                <TableCell className="text-center">{item.statuses.hadir ?? 0}</TableCell>
                                                <TableCell className="text-center">{item.statuses.tidak_hadir ?? 0}</TableCell>
                                                <TableCell className="text-center">{item.statuses.izin ?? 0}</TableCell>
                                                <TableCell className="text-center">{item.statuses.sakit ?? 0}</TableCell>
                                                <TableCell className="text-center font-semibold">{total}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {Object.keys(groupedData).length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">Tidak ada data absensi untuk filter yang dipilih</div>
                            )}
                        </div>

                        {/* Pagination */}
                        {attendanceData.last_page > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Halaman {attendanceData.current_page} dari {attendanceData.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {attendanceData.links.map((link, index) => {
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
            <ExportAttendanceDialog open={openExport} onOpenChange={setOpenExport} terms={terms} sections={sections} initial={formData} />
        </AppLayout>
    );
}
