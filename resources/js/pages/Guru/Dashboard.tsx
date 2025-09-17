import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    ClipboardList,
    // CheckCircle,
    Clock,
    FileText,
    // GraduationCap,
    MessageSquare,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import React from 'react';

// Define interfaces for guru dashboard data
interface GuruProfile {
    id: number;
    user_id: number;
    nidn: string | null;
    nuptk: string | null;
    mapel_keahlian: string | null;
    telepon: string | null;
}

interface Term {
    id: number;
    tahun: string;
    semester: string;
    aktif: boolean;
}

interface Subject {
    id: number;
    kode: string;
    nama: string;
}

interface Section {
    id: number;
    subject: Subject;
    jadwal_json: {
        hari: number;
        jam_mulai: string;
        jam_selesai: string;
        ruang?: string;
    };
}

interface Assignment {
    id: number;
    judul: string;
    deadline: string;
    ungraded_count: number;
    section: {
        subject: Subject;
    };
}

interface Attendance {
    id: number;
    tanggal: string;
    pertemuan_ke: number;
    section: {
        subject: Subject;
    };
}

interface Submission {
    id: number;
    submitted_at: string;
    assignment: {
        judul: string;
        section: {
            subject: Subject;
        };
    };
    user: {
        name: string;
    };
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    published_at: string;
}

interface GuruDashboardProps extends SharedData {
    guru?: GuruProfile;
    currentTerm: Term | null;
    todaySchedule?: Section[];
    assignmentsToGrade?: Assignment[];
    recentAttendance?: Attendance[];
    teachingStats?: {
        total_sections: number;
        total_students: number;
        total_assignments: number;
        pending_grading: number;
    };
    announcements?: Announcement[];
    recentSubmissions?: Submission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Guru',
        href: '/guru/dashboard',
    },
];

const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    href,
}: {
    title: string;
    value: number;
    description: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    href?: string;
}) => {
    const CardComponent = href ? Link : 'div';
    const cardProps = href ? { href } : {};

    return (
        <CardComponent {...cardProps}>
            <Card className={href ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {trend && (
                        <div
                            className={`mt-1 flex items-center text-xs ${
                                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}
                        >
                            <TrendingUp className="mr-1 h-3 w-3" />
                            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}12% dari bulan lalu
                        </div>
                    )}
                </CardContent>
            </Card>
        </CardComponent>
    );
};

const ScheduleCard = ({ schedule }: { schedule: Section[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Jadwal Hari Ini
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {schedule.length > 0 ? (
                    schedule.map((item, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div className="flex-1">
                                <p className="font-medium">{item.subject.nama}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.jadwal_json.jam_mulai} - {item.jadwal_json.jam_selesai}
                                </p>
                                {item.jadwal_json.ruang && <p className="text-sm text-muted-foreground">Ruang: {item.jadwal_json.ruang}</p>}
                            </div>
                            <Badge variant="outline">{item.subject.kode}</Badge>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-muted-foreground">Tidak ada jadwal mengajar hari ini</p>
                )}
            </div>
        </CardContent>
    </Card>
);

const AssignmentsToGradeCard = ({ assignments }: { assignments: Assignment[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="h-5 w-5" />
                Tugas Perlu Dinilai
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {assignments.length > 0 ? (
                    assignments.map((assignment, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div className="flex-1">
                                <p className="font-medium">{assignment.judul}</p>
                                <p className="text-sm text-muted-foreground">{assignment.section.subject.nama}</p>
                                <p className="text-sm text-muted-foreground">
                                    Deadline: {format(new Date(assignment.deadline), 'dd MMM yyyy HH:mm', { locale: id })}
                                </p>
                            </div>
                            <Badge variant="destructive">{assignment.ungraded_count} belum dinilai</Badge>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-muted-foreground">Semua tugas sudah dinilai</p>
                )}
            </div>
            {assignments.length > 0 && (
                <div className="mt-4">
                    <Button asChild className="w-full">
                        <Link href="/guru/penilaian">Lihat Semua Penilaian</Link>
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
);

const RecentSubmissionsCard = ({ submissions }: { submissions: Submission[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Pengumpulan Terbaru
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {submissions.length > 0 ? (
                    submissions.map((submission, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div className="flex-1">
                                <p className="font-medium">{submission.assignment.judul}</p>
                                <p className="text-sm text-muted-foreground">
                                    {submission.assignment.section.subject.nama} - {submission.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(submission.submitted_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                </p>
                            </div>
                            <Badge variant="outline">Baru</Badge>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-muted-foreground">Belum ada pengumpulan terbaru</p>
                )}
            </div>
        </CardContent>
    </Card>
);

export default function GuruDashboard(props: GuruDashboardProps) {
    const { guru, currentTerm, todaySchedule, assignmentsToGrade, recentAttendance, teachingStats, announcements, recentSubmissions } = props;

    // Add default values to prevent undefined errors
    const safeTeachingStats = teachingStats || {
        total_sections: 0,
        total_students: 0,
        total_assignments: 0,
        pending_grading: 0,
    };

    const safeTodaySchedule = todaySchedule || [];
    const safeAssignmentsToGrade = assignmentsToGrade || [];
    const safeRecentAttendance = recentAttendance || [];
    const safeAnnouncements = announcements || [];
    const safeRecentSubmissions = recentSubmissions || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Guru" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard Guru</h1>
                        <p className="text-muted-foreground">
                            Periode: {currentTerm ? `${currentTerm.tahun} - ${currentTerm.semester.toUpperCase()}` : 'Tidak ada periode aktif'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Selamat datang, {guru?.mapel_keahlian ? `Guru ${guru.mapel_keahlian}` : 'Guru'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href="/guru/announcements/create">Buat Pengumuman</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/guru/kelas">Kelola Kelas</Link>
                        </Button>
                    </div>
                </div>

                {/* Teaching Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                >
                    <StatCard
                        title="Kelas Diampu"
                        value={safeTeachingStats.total_sections}
                        description="Kelas aktif periode ini"
                        icon={BookOpen}
                        href="/guru/kelas"
                    />
                    <StatCard title="Total Siswa" value={safeTeachingStats.total_students} description="Siswa yang diajar" icon={Users} />
                    <StatCard
                        title="Total Tugas"
                        value={safeTeachingStats.total_assignments}
                        description="Tugas yang dibuat"
                        icon={FileText}
                        href="/guru/tugas"
                    />
                    <StatCard
                        title="Perlu Dinilai"
                        value={safeTeachingStats.pending_grading}
                        description="Tugas belum dinilai"
                        icon={Clock}
                        href="/guru/penilaian"
                    />
                </motion.div>

                {/* Main Content Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    {/* Today's Schedule */}
                    <ScheduleCard schedule={safeTodaySchedule} />

                    {/* Assignments to Grade */}
                    <AssignmentsToGradeCard assignments={safeAssignmentsToGrade} />

                    {/* Recent Submissions */}
                    <RecentSubmissionsCard submissions={safeRecentSubmissions} />
                </motion.div>

                {/* Recent Attendance and Announcements */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid gap-6 md:grid-cols-2"
                >
                    {/* Recent Attendance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserCheck className="h-5 w-5" />
                                Absensi Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {safeRecentAttendance.length > 0 ? (
                                    safeRecentAttendance.map((attendance, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                            <div className="flex-1">
                                                <p className="font-medium">{attendance.section?.subject?.nama || 'Mata Pelajaran'}</p>
                                                <p className="text-sm text-muted-foreground">Pertemuan ke-{attendance.pertemuan_ke}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(attendance.tanggal), 'dd MMM yyyy', { locale: id })}
                                                </p>
                                            </div>
                                            <Badge variant="outline">Selesai</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-muted-foreground">Belum ada absensi terbaru</p>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/guru/absensi">Kelola Absensi</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Announcements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageSquare className="h-5 w-5" />
                                Pengumuman Terbaru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {safeAnnouncements.length > 0 ? (
                                    safeAnnouncements.map((announcement, index) => (
                                        <div key={index} className="border-l-4 border-primary pl-4">
                                            <h4 className="font-medium">{announcement.title}</h4>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">{announcement.content}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {format(new Date(announcement.published_at), 'dd MMM yyyy', { locale: id })}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-muted-foreground">Belum ada pengumuman</p>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/guru/announcements">Lihat Semua Pengumuman</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AppLayout>
    );
}
