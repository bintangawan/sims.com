import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, Link, PageProps, router } from '@inertiajs/react';
import { format, isValid as isValidDateFn, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, FileBarChart, FileText } from 'lucide-react';
import { useState } from 'react';

/* ===================== Types ===================== */
interface Term {
    id: number;
    nama: string;
    tahun: number;
    aktif: boolean;
}

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    nama: string;
    subject: Subject;
    // Kompatibel: bisa guru.name ATAU guru.user.name
    guru: {
        name?: string;
        user?: { name: string };
    };
}

interface Attendance {
    id: number;
    section: Section;
    // backend kirim kolom 'tanggal'
    tanggal: string;
}

interface AttendanceDetail {
    id: number;
    attendance: Attendance;
    user_id: number;
    status: 'hadir' | 'alpha' | 'izin' | 'sakit';
    note?: string | null;
    created_at: string;
}

interface Statistics {
    total_sessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendance_percentage: number;
}

interface SubjectAttendance {
    subject_name: string;
    total_sessions: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    percentage: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AttendancePaginator {
    data: AttendanceDetail[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
}

interface Filters {
    term_id?: number;
    start_date?: string;
    end_date?: string;
}

interface IndexProps extends PageProps {
    attendanceDetails: AttendancePaginator;
    statistics: Statistics;
    attendanceBySubject: Record<string, SubjectAttendance>;
    terms: Term[];
    currentTerm: Term;
    selectedTermId: number;
    subjects: Subject[]; // ← PAKAI props subjects
    filters: Filters;
}

/* ===================== Helpers ===================== */
const toDateOrNull = (value?: string | Date | null) => {
    if (!value) return null;
    if (value instanceof Date) return isValidDateFn(value) ? value : null;
    let d = parseISO(value as string);
    if (isValidDateFn(d)) return d;
    d = new Date(value as string);
    return isValidDateFn(d) ? d : null;
};

const safeFormat = (value?: string | Date | null, fmt = 'dd MMM yyyy') => {
    const d = toDateOrNull(value);
    return d ? format(d, fmt, { locale: id }) : '-';
};

/* ===================== Date Popover (diperbaiki) ===================== */
function DatePopover({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState<Date | undefined>(value || new Date());

    return (
        <div className="min-w-[260px] flex-1 space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn('h-11 w-full justify-start px-3 text-left font-normal', !value && 'text-muted-foreground')}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(value, 'PPP', { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start" sideOffset={10}>
                    <Calendar
                        mode="single"
                        selected={value}
                        captionLayout="dropdown"
                        month={month}
                        onMonthChange={setMonth}
                        onSelect={(date) => {
                            onChange(date);
                            setOpen(false);
                        }}
                        initialFocus
                        className="p-3"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

/* ===================== Page ===================== */
export default function Index({
    attendanceDetails,
    statistics,
    attendanceBySubject,
    terms,
    currentTerm,
    selectedTermId,
    subjects, // ← gunakan
    filters,
}: IndexProps) {
    // filters -> state
    const [startDate, setStartDate] = useState<Date | undefined>(filters.start_date ? new Date(filters.start_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(filters.end_date ? new Date(filters.end_date) : undefined);

    // value Select semester valid
    const initialTermValue =
        terms.find((t) => t.id === selectedTermId)?.id.toString() ?? (terms[0]?.id !== undefined ? terms[0].id.toString() : undefined);
    const [termId, setTermId] = useState<string | undefined>(initialTermValue);

    // subject selector (untuk by-subject route)
    const [subjectId, setSubjectId] = useState<string | undefined>(undefined);

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (termId) params.term_id = termId;
        if (startDate) params.start_date = format(startDate, 'yyyy-MM-dd');
        if (endDate) params.end_date = format(endDate, 'yyyy-MM-dd');
        router.get(route('siswa.absensi.index'), params, { preserveState: true, preserveScroll: true });
    };

    const goToSubjectDetail = () => {
        if (!subjectId) return;
        // Kirim parameter yang diminta Ziggy: { subject: <id> }
        router.get(route('siswa.absensi.by-subject', { subject: subjectId }));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir':
                return <Badge className="bg-green-500">Hadir</Badge>;
            case 'alpha':
                return <Badge className="bg-red-500">Alpha</Badge>;
            case 'izin':
                return <Badge className="bg-yellow-500">Izin</Badge>;
            case 'sakit':
                return <Badge className="bg-blue-500">Sakit</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Absensi" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Absensi</h2>

                    {/* area kontrol kanan: pilih subject + tombol */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {/* Pilih Mata Pelajaran (untuk by-subject) */}
                        <div className="min-w-[240px]">
                            <Select value={subjectId} onValueChange={setSubjectId}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Pilih mata pelajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects?.length
                                        ? subjects.map((s) => (
                                              <SelectItem key={s.id} value={s.id.toString()}>
                                                  {s.nama}
                                              </SelectItem>
                                          ))
                                        : null}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tombol Detail Per Mata Pelajaran: butuh param `subject` */}
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={goToSubjectDetail}
                            disabled={!subjectId}
                            title={!subjectId ? 'Pilih mata pelajaran dulu' : 'Lihat detail per mata pelajaran'}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Detail Per Mata Pelajaran</span>
                        </Button>

                        {/* Ringkasan (tidak butuh parameter) */}
                        <Link href={route('siswa.absensi.summary')}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <FileBarChart className="h-4 w-4" />
                                <span>Ringkasan Absensi</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Kehadiran</CardTitle>
                            <CardDescription>
                                Semester {currentTerm?.nama ?? ''} {currentTerm?.tahun ?? ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.attendance_percentage}%</div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.present} dari {statistics.total_sessions} sesi
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Hadir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.present}</div>
                            <p className="text-xs text-muted-foreground">sesi</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Izin/Sakit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.excused}</div>
                            <p className="text-xs text-muted-foreground">sesi</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Alpha</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.absent}</div>
                            <p className="text-xs text-muted-foreground">sesi</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>Filter data absensi berdasarkan periode</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-6 md:flex-row">
                            {/* Semester */}
                            <div className="min-w-[260px] flex-1 space-y-2">
                                <label className="text-sm font-medium">Semester</label>
                                <Select value={termId} onValueChange={setTermId}>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Pilih semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {terms.map((term) => (
                                            <SelectItem key={term.id} value={term.id.toString()}>
                                                {term.nama} {term.tahun}
                                                {term.aktif && ' (Aktif)'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tanggal */}
                            <DatePopover label="Tanggal Mulai" value={startDate as Date | undefined} onChange={setStartDate} />
                            <DatePopover label="Tanggal Akhir" value={endDate as Date | undefined} onChange={setEndDate} />

                            <div className="flex items-end">
                                <Button className="h-11" onClick={handleFilter}>
                                    Terapkan Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Absensi</CardTitle>
                        <CardDescription>Daftar kehadiran dalam mata pelajaran</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attendanceDetails.data.length > 0 ? (
                                <>
                                    <div className="rounded-md border">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Tanggal
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Mata Pelajaran
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Guru
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Catatan
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {attendanceDetails.data.map((detail) => (
                                                    <tr key={detail.id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{safeFormat(detail.attendance?.tanggal)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {detail.attendance?.section?.subject?.nama ?? '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {detail.attendance?.section?.guru?.name ??
                                                                detail.attendance?.section?.guru?.user?.name ??
                                                                '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(detail.status)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{detail.note ?? '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {attendanceDetails.last_page > 1 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Halaman {attendanceDetails.current_page} dari {attendanceDetails.last_page}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {attendanceDetails.links.map((link, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={link.active ? 'default' : 'outline'}
                                                        size="sm"
                                                        className="mx-1"
                                                        disabled={!link.url}
                                                        onClick={() => {
                                                            if (link.url) router.visit(link.url);
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-4 text-center">
                                    <p>Tidak ada data absensi yang ditemukan.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Subject Attendance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Per Mata Pelajaran</CardTitle>
                        <CardDescription>Persentase kehadiran per mata pelajaran</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.values(attendanceBySubject).length > 0 ? (
                                <div className="rounded-md border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Mata Pelajaran
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Total Sesi
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Hadir
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Izin/Sakit
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Alpha
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                    Persentase
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {Object.values(attendanceBySubject).map((subject, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{subject.subject_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{subject.total_sessions}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{subject.present}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{subject.excused}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{subject.absent}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="mr-2">{subject.percentage}%</span>
                                                            <div className="h-2.5 w-24 rounded-full bg-gray-200">
                                                                <div
                                                                    className={cn(
                                                                        'h-2.5 rounded-full',
                                                                        subject.percentage >= 75
                                                                            ? 'bg-green-500'
                                                                            : subject.percentage >= 50
                                                                              ? 'bg-yellow-500'
                                                                              : 'bg-red-500',
                                                                    )}
                                                                    style={{ width: `${subject.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p>Tidak ada data absensi per mata pelajaran yang ditemukan.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
