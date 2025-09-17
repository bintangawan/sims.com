import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Calendar, Edit, Users } from 'lucide-react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    subject: Subject;
}

interface User {
    id: number;
    name: string;
    nis: string | null;
}

interface AttendanceDetail {
    id: number;
    user: User;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
    note: string | null;
}

interface Attendance {
    id: number;
    section: Section;
    pertemuan_ke: number;
    tanggal: string;
    details: AttendanceDetail[];
    created_at: string;
}

interface Props {
    attendance: Attendance;
}

const statusOptions = {
    hadir: { label: 'Hadir', color: 'bg-green-100 text-green-800' },
    izin: { label: 'Izin', color: 'bg-yellow-100 text-yellow-800' },
    sakit: { label: 'Sakit', color: 'bg-blue-100 text-blue-800' },
    alpha: { label: 'Alpha', color: 'bg-red-100 text-red-800' },
} as const;

export default function Show({ attendance }: Props) {
    const handleBack = () => {
        router.visit(route('guru.absensi.index', attendance.section.id));
    };

    const handleEdit = () => {
        router.visit(route('guru.absensi.edit', attendance.id));
    };

    const getStatusCounts = () => {
        const counts = {
            hadir: 0,
            izin: 0,
            sakit: 0,
            alpha: 0,
        };

        attendance.details.forEach(detail => {
            counts[detail.status]++;
        });

        return counts;
    };

    const statusCounts = getStatusCounts();
    const totalStudents = attendance.details.length;
    const attendancePercentage = totalStudents > 0 
        ? Math.round((statusCounts.hadir / totalStudents) * 100) 
        : 0;

    return (
        <AppLayout>
            <Head title={`Detail Absensi - ${attendance.section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Detail Absensi</h1>
                            <p className="text-muted-foreground">
                                {attendance.section.subject.nama} - Pertemuan ke-{attendance.pertemuan_ke}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleEdit} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Absensi
                    </Button>
                </div>

                {/* Attendance Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Informasi Absensi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mata Pelajaran</p>
                                <p className="text-lg font-semibold">{attendance.section.subject.nama}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pertemuan Ke</p>
                                <p className="text-lg font-semibold">{attendance.pertemuan_ke}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                                <p className="text-lg font-semibold">
                                    {format(new Date(attendance.tanggal), 'dd MMMM yyyy', { locale: id })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Dibuat</p>
                                <p className="text-lg font-semibold">
                                    {format(new Date(attendance.created_at), 'dd/MM/yyyy HH:mm', { locale: id })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{totalStudents}</p>
                                <p className="text-sm text-muted-foreground">Total Siswa</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{statusCounts.hadir}</p>
                                <p className="text-sm text-muted-foreground">Hadir</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{statusCounts.izin}</p>
                                <p className="text-sm text-muted-foreground">Izin</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{statusCounts.sakit}</p>
                                <p className="text-sm text-muted-foreground">Sakit</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{statusCounts.alpha}</p>
                                <p className="text-sm text-muted-foreground">Alpha</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Attendance Percentage */}
                <Card>
                    <CardContent className="p-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">{attendancePercentage}%</p>
                            <p className="text-muted-foreground">Persentase Kehadiran</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Daftar Siswa ({totalStudents})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attendance.details.map((detail, index) => {
                                const statusInfo = statusOptions[detail.status];
                                
                                return (
                                    <div key={detail.id} className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                    <span className="text-sm font-semibold text-primary">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{detail.user.name}</h4>
                                                    {detail.user.nis && (
                                                        <p className="text-sm text-muted-foreground">NIS: {detail.user.nis}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={statusInfo.color}>
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        {detail.note && (
                                            <div className="mt-3 rounded-md bg-muted p-3">
                                                <p className="text-sm">
                                                    <span className="font-medium">Catatan:</span> {detail.note}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}