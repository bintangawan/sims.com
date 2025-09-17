import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarDays, Eye, Plus, Users } from 'lucide-react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    subject: Subject;
    // backend kadang pakai `capacity`, kadang `kapasitas`
    kapasitas?: number;
    capacity?: number;
}

interface Attendance {
    id: number;
    pertemuan_ke: number;
    tanggal: string;
    students_count: number;
    created_at: string;
}

interface Props {
    section: Section;
    attendances: Attendance[];
}

export default function Index({ section, attendances }: Props) {
    const handleCreateAttendance = () => {
        router.visit(route('guru.absensi.create', section.id));
    };

    const handleViewAttendance = (attendanceId: number) => {
        router.visit(route('guru.absensi.show', attendanceId));
    };

    const kapasitas = section.kapasitas ?? section.capacity ?? 0;

    return (
        <AppLayout>
            <Head title={`Absensi - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Absensi {section.subject.nama}</h1>
                        <p className="text-muted-foreground">Kelola absensi siswa untuk mata pelajaran {section.subject.nama}</p>
                    </div>
                    <Button onClick={handleCreateAttendance} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Buat Absensi Baru
                    </Button>
                </div>

                {/* Section Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Informasi Kelas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Mata Pelajaran</p>
                                <p className="text-lg font-semibold">{section.subject.nama}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kode</p>
                                <p className="text-lg font-semibold">{section.subject.kode}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kapasitas</p>
                                <p className="text-lg font-semibold">{kapasitas} siswa</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Absensi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {attendances.length === 0 ? (
                            <div className="py-8 text-center">
                                <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">Belum Ada Absensi</h3>
                                <p className="mb-4 text-muted-foreground">Mulai buat absensi pertama untuk kelas ini</p>
                                <Button onClick={handleCreateAttendance} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Buat Absensi Baru
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {attendances.map((attendance) => (
                                    <div
                                        key={attendance.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                                <span className="text-lg font-bold text-primary">{attendance.pertemuan_ke}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Pertemuan ke-{attendance.pertemuan_ke}</h4>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {format(new Date(attendance.tanggal), 'dd MMMM yyyy', { locale: id })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {attendance.students_count} siswa
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{format(new Date(attendance.created_at), 'dd/MM/yyyy')}</Badge>
                                            <Button variant="outline" size="sm" onClick={() => handleViewAttendance(attendance.id)} className="gap-2">
                                                <Eye className="h-4 w-4" />
                                                Lihat Detail
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
