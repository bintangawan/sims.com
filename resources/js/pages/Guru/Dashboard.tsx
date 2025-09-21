import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Clock, 
    Users, 
    BookOpen, 
    FileText, 
    TrendingUp, 
    ClipboardList,
    UserCheck,
    Calendar,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { type BreadcrumbItem, type SharedData } from '@/types';

// ================== Types ==================
interface GuruProfile {
    id: number;
    user_id: number;
    nip: string;
    nama: string;
    alamat: string;
    telepon: string;
    tanggal_lahir: string;
    jenis_kelamin: 'L' | 'P';
    pendidikan_terakhir: string;
    mata_pelajaran: string;
    status: 'aktif' | 'nonaktif';
    created_at: string;
    updated_at: string;
    nidn?: string | null;
    nuptk?: string | null;
    mapel_keahlian?: string | null;
}

interface Term {
    id: number;
    nama: string;
    tahun_ajaran: string;
    semester: 'ganjil' | 'genap';
    tanggal_mulai: string;
    tanggal_selesai: string;
    aktif: boolean;
    created_at: string;
    updated_at: string;
    tahun?: string;
}

interface Subject {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string;
    sks: number;
    created_at: string;
    updated_at: string;
}

interface Section {
    id: number;
    subject_id: number;
    guru_id: number;
    term_id: number;
    nama: string;
    kapasitas: number;
    ruangan: string;
    jadwal_json: Array<{
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        ruangan: string;
    }>;
    jadwal_today?: Array<{
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        ruangan: string;
    }>;
    created_at: string;
    updated_at: string;
    subject: Subject;
    term: Term;
    student_count?: number;
    assignment_count?: number;
    material_count?: number;
    attendance_rate?: number;
    students_count?: number;
}

interface Assignment {
    id: number;
    section_id: number;
    title?: string;
    judul?: string;
    deskripsi: string;
    deadline: string;
    max_score: number;
    created_at: string;
    updated_at: string;
    section: Section;
    ungraded_count?: number;
}

interface Attendance {
    id: number;
    section_id: number;
    tanggal: string;
    created_at: string;
    updated_at: string;
    section: Section;
    students_count?: number;
    pertemuan_ke?: number;
}

interface Submission {
    id: number;
    assignment_id: number;
    user_id: number;
    file_path: string;
    submitted_at: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
    updated_at: string;
    assignment: Assignment;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    scope_type: 'global' | 'role' | 'section';
    role_name: string | null;
    section_id: number | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

interface AttendanceStats {
    present_today: number;
    absent_today: number;
    sick_today: number;
    permission_today: number;
}

interface GuruDashboardProps extends SharedData {
    guru?: GuruProfile | null;
    currentTerm?: Term | null;
    todaySchedule?: Section[] | null;
    assignmentsToGrade?: Assignment[] | null;
    recentAttendance?: Attendance[] | null;
    teachingStats?: {
        total_sections?: number;
        total_students?: number;
        total_assignments?: number;
        pending_grading?: number;
    } | null;
    announcements?: Announcement[] | null;
    recentSubmissions?: Submission[] | null;
    attendanceStats?: AttendanceStats | null;
    upcomingDeadlines?: Assignment[] | null;
    classDetails?: Section[] | null;
}

// ================== Breadcrumbs ==================
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard Guru',
        href: '/guru/dashboard',
    },
];

// ================== Helpers ==================
const fmtDate = (d?: string) => (d ? format(new Date(d), 'dd MMM yyyy', { locale: localeID }) : '—');
const fmtDateTime = (d?: string) => (d ? format(new Date(d), 'dd MMM yyyy HH:mm', { locale: localeID }) : '—');

// ================== UI Fragments ==================
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
                    <div className="text-2xl font-bold">{(value ?? 0).toLocaleString()}</div>
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
                        <div key={item.id ?? index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div className="flex-1">
                                <p className="font-medium">{item.subject?.nama ?? 'Mata Pelajaran'}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.jadwal_today?.[0]?.jam_mulai ?? '--:--'} - {item.jadwal_today?.[0]?.jam_selesai ?? '--:--'}
                                </p>
                                {item.jadwal_today?.[0]?.ruangan && <p className="text-sm text-muted-foreground">Ruangan: {item.jadwal_today?.[0]?.ruangan}</p>}
                            </div>
                            <Badge variant="outline">{item.subject?.kode ?? '-'}</Badge>
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
                        <div key={assignment.id ?? index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div className="flex-1">
                                <p className="font-medium">{assignment.judul ?? 'Tanpa Judul'}</p>
                                <p className="text-sm text-muted-foreground">{assignment.section?.subject?.nama ?? 'Mata Pelajaran'}</p>
                                <p className="text-sm text-muted-foreground">Deadline: {fmtDateTime(assignment.deadline)}</p>
                            </div>
                            <Badge variant="destructive">{assignment.ungraded_count ?? 0} belum dinilai</Badge>
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
                        <div key={submission.id ?? index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                            <div className="flex-1">
                                <p className="font-medium">{submission.assignment?.judul ?? 'Tanpa Judul'}</p>
                                <p className="text-sm text-muted-foreground">
                                    {submission.assignment?.section?.subject?.nama ?? 'Mata Pelajaran'} - {submission.user?.name ?? 'Siswa'}
                                </p>
                                <p className="text-sm text-muted-foreground">{fmtDateTime(submission.submitted_at)}</p>
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

// ================== Page ==================
export default function GuruDashboard(props: GuruDashboardProps) {
    const { guru, currentTerm, todaySchedule, assignmentsToGrade, recentAttendance, teachingStats, announcements, recentSubmissions } = props;

    // Default & safety guards
    const safeTeachingStats = {
        total_sections: teachingStats?.total_sections ?? 0,
        total_students: teachingStats?.total_students ?? 0,
        total_assignments: teachingStats?.total_assignments ?? 0,
        pending_grading: teachingStats?.pending_grading ?? 0,
    };

    const safeTodaySchedule: Section[] = Array.isArray(todaySchedule) ? todaySchedule : [];
    const safeAssignmentsToGrade: Assignment[] = Array.isArray(assignmentsToGrade) ? assignmentsToGrade : [];
    const safeRecentAttendance: Attendance[] = Array.isArray(recentAttendance) ? recentAttendance : [];
    const safeAnnouncements: Announcement[] = Array.isArray(announcements) ? announcements : [];
    const safeRecentSubmissions: Submission[] = Array.isArray(recentSubmissions) ? recentSubmissions : [];

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
                                        <div key={attendance.id ?? index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                            <div className="flex-1">
                                                <p className="font-medium">{attendance.section?.subject?.nama ?? 'Mata Pelajaran'}</p>
                                                <p className="text-sm text-muted-foreground">Pertemuan ke-{attendance.pertemuan_ke ?? '-'}</p>
                                                <p className="text-sm text-muted-foreground">{fmtDate(attendance.tanggal)}</p>
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
                                        <div key={announcement.id ?? index} className="border-l-4 border-primary pl-4">
                                            <h4 className="font-medium">{announcement.title ?? 'Tanpa Judul'}</h4>
                                            <p className="line-clamp-2 text-sm text-muted-foreground">{announcement.content ?? ''}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">{fmtDate(announcement.published_at ?? undefined)}</p>
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
