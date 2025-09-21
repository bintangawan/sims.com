import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock, GraduationCap, TrendingUp, User, Users, XCircle } from 'lucide-react';
import React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface SiswaProfile {
    id: number;
    user_id: number;
    nis: string;
    angkatan: number;
    kelas: string | null;
    wali_kelas_id: number | null;
    user: User;
}

interface Subject {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
}

interface GuruUser {
    id: number;
    name: string;
    email: string;
}

interface Guru {
    id: number;
    user_id: number;
    user: GuruUser;
}

interface Section {
    id: number;
    subject_id: number;
    guru_id: number;
    term_id: number;
    kapasitas: number | null;
    jadwal_json: Array<{
        hari: string;
        ruangan: string;
        jam_mulai: string;
        jam_selesai: string;
    }>;
    subject: Subject;
    guru: Guru;
}

interface Assignment {
    id: number;
    section_id: number;
    judul: string;
    deskripsi: string;
    tipe: 'file' | 'teks' | 'link' | 'campuran';
    deadline: string;
    section: {
        subject: Subject;
    };
}

interface Grade {
    id: number;
    section_id: number;
    user_id: number;
    komponen: string;
    skor: number;
    bobot: number;
    created_at: string;
    section: {
        subject: Subject;
    };
}

interface AttendanceSummary {
    hadir?: number;
    izin?: number;
    sakit?: number;
    alpha?: number;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    scope_type: 'global' | 'section' | 'role';
    scope_id: number | null;
    role_name: string | null;
    published_at: string | null;
    created_by: number;
}

interface Term {
    id: number;
    nama: string;
    tahun: string;
    semester: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    aktif: boolean;
}

interface AcademicSummary {
    rata_rata: number | null;
    total_nilai: number;
}

interface Props {
    siswa: SiswaProfile;
    currentTerm: Term | null;
    todaySchedule: Section[];
    upcomingAssignments: Assignment[];
    recentGrades: Grade[];
    attendanceSummary: AttendanceSummary;
    announcements: Announcement[];
    academicSummary: AcademicSummary;
}

const fmtDate = (date: string | null | undefined): string => {
    if (!date) return '-';
    return format(new Date(date), 'dd MMM yyyy', { locale: id });
};

const fmtDateTime = (date: string | null | undefined): string => {
    if (!date) return '-';
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: id });
};

const getAttendanceIcon = (status: string) => {
    switch (status) {
        case 'hadir':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'izin':
            return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'sakit':
            return <AlertCircle className="h-4 w-4 text-blue-500" />;
        case 'alpha':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return null;
    }
};

const getAttendanceColor = (status: string) => {
    switch (status) {
        case 'hadir':
            return 'bg-green-100 text-green-800';
        case 'izin':
            return 'bg-yellow-100 text-yellow-800';
        case 'sakit':
            return 'bg-blue-100 text-blue-800';
        case 'alpha':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const Dashboard: React.FC<Props> = ({
    siswa,
    currentTerm,
    todaySchedule,
    upcomingAssignments,
    recentGrades,
    attendanceSummary,
    announcements,
    academicSummary,
}) => {
    const totalAttendance = Object.values(attendanceSummary).reduce((sum, count) => sum + count, 0);
    const attendancePercentage = totalAttendance > 0 ? ((attendanceSummary.hadir || 0) / totalAttendance) * 100 : 0;

    const safeAcademicSummary: AcademicSummary = academicSummary ?? { rata_rata: null, total_nilai: 0 };

    return (
        <AppLayout>
            <Head title="Dashboard Siswa" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Siswa</h1>
                        <p className="text-muted-foreground">
                            {currentTerm ? (
                                <span>
                                    {currentTerm.tahun} - {currentTerm.semester}
                                </span>
                            ) : (
                                <span>Tahun ajaran belum ditentukan</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <User className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Selamat datang, {siswa?.user?.name || 'Siswa'}!</CardTitle>
                                        <CardDescription>
                                            NIS: {siswa?.nis || '-'} | Kelas: {siswa?.kelas || 'Belum ditentukan'} | Angkatan:{' '}
                                            {siswa?.angkatan || '-'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Kehadiran Bulan Ini</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{attendancePercentage.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {attendanceSummary.hadir || 0} dari {totalAttendance} pertemuan
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {safeAcademicSummary.rata_rata ? safeAcademicSummary.rata_rata.toFixed(1) : '-'}
                                </div>
                                <p className="text-xs text-muted-foreground">Dari {safeAcademicSummary.total_nilai} penilaian</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tugas Mendatang</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
                                <p className="text-xs text-muted-foreground">Dalam 7 hari ke depan</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{todaySchedule.length}</div>
                                <p className="text-xs text-muted-foreground">Mata pelajaran</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Today's Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Jadwal Hari Ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {todaySchedule.length > 0 ? (
                                    <div className="space-y-4">
                                        {todaySchedule.map((schedule) => (
                                            <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <h4 className="font-medium">{schedule.subject.nama}</h4>
                                                    <p className="text-sm text-gray-600">{schedule.guru.user.name}</p>
                                                    {schedule.jadwal_json[0] && (
                                                        <p className="text-sm text-gray-500">{schedule.jadwal_json[0].ruangan}</p>
                                                    )}
                                                </div>
                                                {schedule.jadwal_json[0] && (
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Clock className="h-4 w-4" />
                                                            {schedule.jadwal_json[0].jam_mulai} - {schedule.jadwal_json[0].jam_selesai}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500">Tidak ada jadwal hari ini</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Upcoming Assignments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Tugas Mendatang
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {upcomingAssignments.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingAssignments.map((assignment) => (
                                            <div key={assignment.id} className="rounded-lg border p-3">
                                                <div className="mb-2 flex items-start justify-between">
                                                    <h4 className="font-medium">{assignment.judul}</h4>
                                                    <Badge variant="outline">{assignment.tipe}</Badge>
                                                </div>
                                                <p className="mb-2 text-sm text-gray-600">{assignment.section.subject.nama}</p>
                                                <div className="flex items-center gap-1 text-sm text-red-600">
                                                    <Clock className="h-4 w-4" />
                                                    Deadline: {fmtDateTime(assignment.deadline)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500">Tidak ada tugas mendatang</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Recent Grades */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Nilai Terbaru
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentGrades.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentGrades.map((grade) => (
                                            <div key={grade.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <h4 className="font-medium">{grade.section.subject.nama}</h4>
                                                    <p className="text-sm text-gray-600">{grade.komponen}</p>
                                                    <p className="text-xs text-gray-500">{fmtDate(grade.created_at)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{grade.skor}</div>
                                                    <p className="text-xs text-gray-500">Bobot: {grade.bobot}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="py-4 text-center text-gray-500">Belum ada nilai</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Attendance Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Ringkasan Kehadiran
                                </CardTitle>
                                <CardDescription>Bulan ini</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(attendanceSummary).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getAttendanceIcon(status)}
                                                <span className="capitalize">{status}</span>
                                            </div>
                                            <Badge className={getAttendanceColor(status)}>{count}</Badge>
                                        </div>
                                    ))}
                                    {totalAttendance === 0 && <p className="py-4 text-center text-gray-500">Belum ada data kehadiran bulan ini</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Announcements */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengumuman Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {announcements.length > 0 ? (
                                <div className="space-y-4">
                                    {announcements.map((announcement) => (
                                        <div key={announcement.id} className="rounded-lg border p-4">
                                            <div className="mb-2 flex items-start justify-between">
                                                <h4 className="font-medium">{announcement.title}</h4>
                                                <Badge variant="outline">
                                                    {announcement.scope_type === 'global'
                                                        ? 'Umum'
                                                        : announcement.scope_type === 'role'
                                                          ? 'Siswa'
                                                          : 'Kelas'}
                                                </Badge>
                                            </div>
                                            <p className="mb-2 text-gray-600">{announcement.content}</p>
                                            <p className="text-xs text-gray-500">{fmtDateTime(announcement.published_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-gray-500">Tidak ada pengumuman</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
