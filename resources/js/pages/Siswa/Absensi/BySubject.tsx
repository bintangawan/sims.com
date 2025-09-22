import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, PageProps, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/* ===================== Types ===================== */
interface Term {
    id: number;
    tahun: string | number;
    semester: string;
    aktif: boolean;
}

interface User {
    id: number;
    name: string;
}

interface Guru {
    id?: number;
    user?: User; // pastikan di controller eager-load guru.user
}

interface Subject {
    id: number;
    nama: string;
    kode?: string;
}

interface Section {
    id: number;
    guru?: Guru;
    subject?: Subject;
}

interface Attendance {
    id: number;
    date: string; // dari DB (Y-m-d)
    section?: Section;
}

interface AttendanceDetail {
    id: number;
    status: 'hadir' | 'alpha' | 'izin' | 'sakit';
    note?: string | null;
    created_at: string;
    attendance: Attendance;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Paginator bisa datar atau meta
 */
interface AnyPaginator<T> {
    data: T[];
    // flat shape
    current_page?: number;
    last_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    links?: PaginationLink[];

    // meta shape
    meta?: {
        current_page?: number;
        last_page?: number;
        from?: number;
        to?: number;
        total?: number;
        links?: PaginationLink[];
    };
}

interface Statistics {
    total_sessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendance_percentage: number;
}

interface BySubjectProps extends PageProps {
    subject: Subject;
    attendanceDetails: AnyPaginator<AttendanceDetail>;
    statistics: Statistics;
    terms: Term[];
    currentTerm: Term | null;
    selectedTermId: number | null;
}

/* ===================== Helpers ===================== */
const statusBadgeColor = (status: AttendanceDetail['status']) => {
    switch (status) {
        case 'hadir':
            return 'bg-green-500 text-white';
        case 'izin':
        case 'sakit':
            return 'bg-yellow-500 text-white';
        default:
            return 'bg-red-500 text-white';
    }
};

const coalescePage = (p: AnyPaginator<unknown>) => {
    const meta = p.meta ?? {};
    return {
        from: (meta.from ?? p.from ?? 0) || 0,
        to: (meta.to ?? p.to ?? p.data?.length ?? 0) || 0,
        total: (meta.total ?? p.total ?? p.data?.length ?? 0) || 0,
        links: (meta.links ?? p.links ?? []) as PaginationLink[],
    };
};

/* ===================== Component ===================== */
export default function BySubject({ subject, attendanceDetails, statistics, terms, currentTerm, selectedTermId }: BySubjectProps) {
    // --- Select term: jadikan controlled sejak awal ---
    const initialTermStr = useMemo(() => {
        // pilih urutan prioritas: selectedTermId -> term aktif -> term[0]
        const fallbackId = selectedTermId ?? currentTerm?.id ?? (terms.length > 0 ? terms[0].id : null);

        return fallbackId !== null && fallbackId !== undefined ? String(fallbackId) : ''; // selalu string agar controlled stabil
    }, [selectedTermId, currentTerm, terms]);

    const [termValue, setTermValue] = useState<string>(initialTermStr);

    // Jika terms berubah & termValue masih kosong, isi dengan term pertama
    useEffect(() => {
        if (!termValue && terms.length > 0) {
            setTermValue(String(terms[0].id));
        }
    }, [terms, termValue]);

    const handleTermChange = (value: string) => {
        setTermValue(value); // tetap controlled
        router.get(
            route('siswa.absensi.by-subject', { subject: subject.id }), // pastikan nama route sesuai controller
            { term_id: value },
            { preserveState: true },
        );
    };

    // (Opsional) Export — sesuaikan ke route absensi versi kamu
    const handleExport = () => {
        // ganti ke route export absensi subject kalau ada
        window.location.href = route('siswa.absensi.export-subject', {
            term_id: termValue,
            subject_id: subject.id,
        });
    };

    // Pagination aman untuk flat/meta
    const { from, to, total, links } = coalescePage(attendanceDetails);

    return (
        <AppLayout>
            <Head title={`Absensi - ${subject.nama}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            {/* Header + Term Picker + Export */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">{subject.nama}</h2>
                                    <p className="text-gray-600">{subject.kode ?? ''}</p>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Semester:</span>
                                        <Select value={termValue} onValueChange={handleTermChange}>
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Pilih Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {terms.map((t) => (
                                                    <SelectItem key={t.id} value={String(t.id)}>
                                                        {t.tahun} - {t.semester}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center space-x-1">
                                        <Download className="h-4 w-4" />
                                        <span>Export</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Total Pertemuan</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.total_sessions}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Hadir</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.present}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Izin/Sakit</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.excused}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Alpha</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.absent}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">% Kehadiran</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.attendance_percentage}%</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Tabel Absensi */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daftar Absensi</CardTitle>
                                    <CardDescription>
                                        Semester {currentTerm ? `${currentTerm.tahun} - ${currentTerm.semester}` : 'Aktif'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-600">
                                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                                <tr>
                                                    <th className="px-6 py-3">Tanggal</th>
                                                    <th className="px-6 py-3">Guru</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3">Catatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceDetails.data.map((row) => (
                                                    <tr key={row.id} className="border-b bg-white hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            {new Date(row.attendance?.date ?? row.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">{row.attendance?.section?.guru?.user?.name ?? '-'}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="outline" className={statusBadgeColor(row.status)}>
                                                                {row.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">{row.note ?? '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {from} hingga {to} dari {total} hasil
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {links.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="mx-1"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
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
