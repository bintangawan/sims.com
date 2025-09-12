import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, FileText, MessageSquare, TrendingUp, UserCheck, Users, XCircle } from 'lucide-react';
import React from 'react';

// Define proper interfaces for admin dashboard data
interface AdminDashboardProps extends SharedData {
    currentTerm: {
        id: number;
        tahun: string;
        semester: string;
        aktif: boolean;
    } | null;
    userStats: {
        total_users: number;
        siswa_count: number;
        guru_count: number;
        admin_count: number;
    };
    academicStats: {
        total_sections: number;
        total_subjects: number;
        total_assignments: number;
        pending_submissions: number;
        total_announcements: number;
    };
    attendanceStats: {
        present_today: number;
        absent_today: number;
        late_today: number;
    };
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        created_at: string;
        roles: Array<{ name: string }>;
    }>;
    recentAssignments: Array<{
        id: number;
        title: string;
        deadline: string;
        created_at: string;
        section: {
            subject: { name: string };
            guru: { user: { name: string } };
        };
    }>;
    overdueAssignments: Array<{
        id: number;
        title: string;
        deadline: string;
        ungraded_count: number;
        section: {
            subject: { name: string };
            guru: { user: { name: string } };
        };
    }>;
    announcements: Array<{
        id: number;
        title: string;
        content: string;
        published_at: string;
    }>;
    monthlyStats: {
        assignments_created: number;
        submissions_received: number;
        new_users: number;
    };
}

interface ActivityItem {
    id: number;
    name?: string;
    email?: string;
    title?: string;
    deadline?: string;
    created_at?: string; // Make this optional
    roles?: Array<{ name: string }>;
    section?: {
        subject: { name: string };
        guru: { user: { name: string } };
    };
    ungraded_count?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
}: {
    title: string;
    value: number;
    description: string;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
}) => (
    <Card>
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
);

const RecentActivityCard = ({ title, items, type }: { title: string; items: ActivityItem[]; type: 'users' | 'assignments' | 'overdue' }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {items.length > 0 ? (
                    items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                            <div className="flex-1">
                                {type === 'users' && (
                                    <>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.email}</p>
                                        <Badge variant="outline" className="mt-1">
                                            {item.roles?.[0]?.name || 'No Role'}
                                        </Badge>
                                    </>
                                )}
                                {(type === 'assignments' || type === 'overdue') && (
                                    <>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.section?.subject.name} - {item.section?.guru.user.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Deadline: {item.deadline ? new Date(item.deadline).toLocaleDateString('id-ID') : 'N/A'}
                                        </p>
                                        {type === 'overdue' && (
                                            <Badge variant="destructive" className="mt-1">
                                                {item.ungraded_count || 0} belum dinilai
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : 'N/A'}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">Tidak ada data terbaru</p>
                )}
            </div>
        </CardContent>
    </Card>
);

export default function AdminDashboard(props: AdminDashboardProps) {
    const { currentTerm, userStats, academicStats, attendanceStats, recentUsers, recentAssignments, overdueAssignments, announcements } = props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Periode: {currentTerm ? `${currentTerm.tahun} - ${currentTerm.semester.toUpperCase()}` : 'Tidak ada periode aktif'}
                        </p>
                    </div>
                    <Button>Kelola Sistem</Button>
                </div>

                {/* User Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                >
                    <StatCard title="Total Pengguna" value={userStats.total_users} description="Semua pengguna sistem" icon={Users} trend="up" />
                    <StatCard title="Siswa" value={userStats.siswa_count} description="Siswa terdaftar" icon={UserCheck} trend="up" />
                    <StatCard title="Guru" value={userStats.guru_count} description="Guru aktif" icon={BookOpen} trend="neutral" />
                    <StatCard title="Admin" value={userStats.admin_count} description="Administrator" icon={Users} trend="neutral" />
                </motion.div>

                {/* Academic Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
                >
                    <StatCard title="Kelas" value={academicStats.total_sections} description="Kelas aktif" icon={BookOpen} />
                    <StatCard title="Mata Pelajaran" value={academicStats.total_subjects} description="Total mapel" icon={FileText} />
                    <StatCard title="Tugas" value={academicStats.total_assignments} description="Tugas periode ini" icon={FileText} />
                    <StatCard title="Belum Dinilai" value={academicStats.pending_submissions} description="Tugas belum dinilai" icon={Clock} />
                    <StatCard title="Pengumuman" value={academicStats.total_announcements} description="Total pengumuman" icon={MessageSquare} />
                </motion.div>

                {/* Attendance Today */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid gap-4 md:grid-cols-3"
                >
                    <StatCard title="Hadir Hari Ini" value={attendanceStats.present_today} description="Siswa hadir" icon={CheckCircle} />
                    <StatCard title="Tidak Hadir" value={attendanceStats.absent_today} description="Siswa tidak hadir" icon={XCircle} />
                    <StatCard title="Terlambat" value={attendanceStats.late_today} description="Siswa terlambat" icon={Clock} />
                </motion.div>

                {/* Recent Activities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                    <RecentActivityCard title="Pengguna Terbaru" items={recentUsers} type="users" />
                    <RecentActivityCard title="Tugas Terbaru" items={recentAssignments} type="assignments" />
                    <RecentActivityCard title="Tugas Terlambat" items={overdueAssignments} type="overdue" />
                </motion.div>

                {/* Announcements */}
                {announcements.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Pengumuman Terbaru</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {announcements.map((announcement, announcementIndex) => (
                                        <div key={announcementIndex} className="border-l-4 border-primary pl-4">
                                            <h4 className="font-medium">{announcement.title}</h4>
                                            <p className="mt-1 text-sm text-muted-foreground">{announcement.content.substring(0, 150)}...</p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {new Date(announcement.published_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
