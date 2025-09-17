import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
// import { id } from 'date-fns/locale';
import { ArrowLeft, BarChart3, Download } from 'lucide-react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    subject: Subject;
}

interface Meeting {
    pertemuan_ke: number;
    tanggal: string;
}

interface User {
    id: number;
    name: string;
    nis: string | null;
}

interface StudentAttendance {
    pertemuan_ke: number;
    tanggal: string;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
    note: string | null;
}

interface StudentSummary {
    user: User;
    attendances: StudentAttendance[];
    summary: {
        hadir: number;
        izin: number;
        sakit: number;
        alpha: number;
    };
    attendance_percentage: number;
}

interface Props {
    section: Section;
    meetings: Meeting[];
    summary: StudentSummary[];
}

const statusOptions = {
    hadir: { label: 'H', color: 'bg-green-100 text-green-800', fullLabel: 'Hadir' },
    izin: { label: 'I', color: 'bg-yellow-100 text-yellow-800', fullLabel: 'Izin' },
    sakit: { label: 'S', color: 'bg-blue-100 text-blue-800', fullLabel: 'Sakit' },
    alpha: { label: 'A', color: 'bg-red-100 text-red-800', fullLabel: 'Alpha' },
} as const;

export default function Summary({ section, meetings, summary }: Props) {
    const handleBack = () => {
        router.visit(route('guru.absensi.index', section.id));
    };

    const handleExport = () => {
        // Implementasi export bisa ditambahkan di controller
        window.print();
    };

    const getOverallStats = () => {
        const totalStudents = summary.length;
        const totalMeetings = meetings.length;

        if (totalStudents === 0 || totalMeetings === 0) {
            return {
                averageAttendance: 0,
                totalPresent: 0,
                totalAbsent: 0,
            };
        }

        const totalAttendancePercentage = summary.reduce((sum, student) => sum + student.attendance_percentage, 0);

        const averageAttendance = Math.round(totalAttendancePercentage / totalStudents);

        const totalPresent = summary.reduce((sum, student) => sum + student.summary.hadir, 0);
        const totalPossibleAttendance = totalStudents * totalMeetings;
        const totalAbsent = totalPossibleAttendance - totalPresent;

        return {
            averageAttendance,
            totalPresent,
            totalAbsent,
        };
    };

    const overallStats = getOverallStats();

    return (
        <AppLayout>
            <Head title={`Ringkasan Absensi - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Ringkasan Absensi</h1>
                            <p className="text-muted-foreground">
                                {section.subject.nama} - {section.subject.kode}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleExport} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>

                {/* Overall Statistics */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{summary.length}</p>
                                <p className="text-sm text-muted-foreground">Total Siswa</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{meetings.length}</p>
                                <p className="text-sm text-muted-foreground">Total Pertemuan</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-primary">{overallStats.averageAttendance}%</p>
                                <p className="text-sm text-muted-foreground">Rata-rata Kehadiran</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{overallStats.totalPresent}</p>
                                <p className="text-sm text-muted-foreground">Total Kehadiran</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Legend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Keterangan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {Object.entries(statusOptions).map(([key, option]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <Badge className={option.color}>{option.label}</Badge>
                                    <span className="text-sm">{option.fullLabel}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Summary Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Ringkasan Kehadiran Siswa
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">No</TableHead>
                                        <TableHead>Nama Siswa</TableHead>
                                        <TableHead className="w-20">NIS</TableHead>
                                        {meetings.map((meeting) => (
                                            <TableHead key={meeting.pertemuan_ke} className="w-16 text-center">
                                                <div className="text-xs">
                                                    <div>P{meeting.pertemuan_ke}</div>
                                                    <div className="text-muted-foreground">{format(new Date(meeting.tanggal), 'dd/MM')}</div>
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-16 text-center">H</TableHead>
                                        <TableHead className="w-16 text-center">I</TableHead>
                                        <TableHead className="w-16 text-center">S</TableHead>
                                        <TableHead className="w-16 text-center">A</TableHead>
                                        <TableHead className="w-20 text-center">%</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {summary.map((student, index) => (
                                        <TableRow key={student.user.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{student.user.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{student.user.nis || '-'}</TableCell>
                                            {meetings.map((meeting) => {
                                                const attendance = student.attendances.find((a) => a.pertemuan_ke === meeting.pertemuan_ke);
                                                const status = attendance?.status || 'alpha';
                                                const statusInfo = statusOptions[status];

                                                return (
                                                    <TableCell key={meeting.pertemuan_ke} className="text-center">
                                                        <Badge
                                                            className={`${statusInfo.color} text-xs`}
                                                            title={`${statusInfo.fullLabel}${attendance?.note ? ` - ${attendance.note}` : ''}`}
                                                        >
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-medium text-green-600">{student.summary.hadir}</TableCell>
                                            <TableCell className="text-center font-medium text-yellow-600">{student.summary.izin}</TableCell>
                                            <TableCell className="text-center font-medium text-blue-600">{student.summary.sakit}</TableCell>
                                            <TableCell className="text-center font-medium text-red-600">{student.summary.alpha}</TableCell>
                                            <TableCell className="text-center font-bold">
                                                <Badge variant={student.attendance_percentage >= 75 ? 'default' : 'destructive'}>
                                                    {student.attendance_percentage}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
