import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, FileText, GraduationCap, Users } from 'lucide-react';

interface Stats {
    total_siswa: number;
    total_guru: number;
    total_sections: number;
    attendance_rate: number;
}

interface Term {
    id: number;
    nama: string;
    tahun: string;
    aktif: boolean;
}

interface Props {
    stats: Stats;
    activeTerm: Term;
}

export default function LaporanIndex({ stats, activeTerm }: Props) {
    const reportCards = [
        {
            title: 'Laporan Absensi',
            description: 'Lihat dan analisis data kehadiran siswa',
            icon: Users,
            href: '/admin/laporan/attendance',
            color: 'bg-blue-500',
        },
        {
            title: 'Laporan Nilai',
            description: 'Analisis nilai dan prestasi siswa',
            icon: GraduationCap,
            href: '/admin/laporan/grades',
            color: 'bg-green-500',
        },
        {
            title: 'Beban Mengajar',
            description: 'Laporan beban mengajar guru',
            icon: BookOpen,
            href: '/admin/laporan/workload',
            color: 'bg-purple-500',
        },
    ];

    return (
        <AppLayout>
            <Head title="Laporan" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
                        <p className="text-muted-foreground">Dashboard laporan untuk periode {activeTerm?.nama}</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_siswa}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Guru</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_guru}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_sections}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tingkat Kehadiran</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.attendance_rate}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Navigation Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {reportCards.map((report, index) => {
                        const Icon = report.icon;
                        return (
                            <Card key={index} className="transition-shadow hover:shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center space-x-2">
                                        <div className={`rounded-lg p-2 ${report.color} text-white`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{report.title}</CardTitle>
                                            <CardDescription>{report.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Link href={report.href}>
                                        <Button className="w-full">Lihat Laporan</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
