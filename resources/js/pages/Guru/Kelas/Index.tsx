import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BookOpen, Calendar, Clock, Search, Users } from 'lucide-react';
import { useState } from 'react';

// Types
interface Subject {
    id: number;
    kode: string;
    nama: string;
    deskripsi?: string;
}

interface Term {
    id: number;
    tahun: string;
    semester: string;
    aktif: boolean;
}

interface JadwalItem {
    hari: string;
    ruangan: string;
    jam_mulai: string;
    jam_selesai: string;
}

interface Section {
    id: number;
    subject: Subject;
    term: Term;
    kapasitas: number;
    jadwal_json: JadwalItem[];
    student_count: number;
    created_at: string;
}

interface Props {
    sections: Section[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/guru/dashboard',
    },
    {
        title: 'Kelas',
        href: '/guru/kelas',
    },
];

const formatJadwal = (jadwalJson: JadwalItem[]) => {
    if (!jadwalJson || jadwalJson.length === 0) {
        return 'Belum dijadwalkan';
    }

    return jadwalJson
        .map(
            (jadwal) => `${jadwal.hari.charAt(0).toUpperCase() + jadwal.hari.slice(1)} ${jadwal.jam_mulai}-${jadwal.jam_selesai} (${jadwal.ruangan})`,
        )
        .join(', ');
};

const getStatusBadge = (studentCount: number, kapasitas: number) => {
    const percentage = (studentCount / kapasitas) * 100;

    if (percentage >= 90) {
        return <Badge variant="destructive">Penuh</Badge>;
    } else if (percentage >= 70) {
        return <Badge variant="secondary">Hampir Penuh</Badge>;
    } else {
        return <Badge variant="default">Tersedia</Badge>;
    }
};

export default function KelasIndex({ sections }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSections = sections.filter(
        (section) =>
            section.subject.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.subject.kode.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Kelas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Daftar Kelas</h1>
                        <p className="text-muted-foreground">Kelola kelas yang Anda ajar</p>
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari mata pelajaran..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.length}</div>
                            <p className="text-xs text-muted-foreground">Kelas yang Anda ajar</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.reduce((total, section) => total + section.student_count, 0)}</div>
                            <p className="text-xs text-muted-foreground">Siswa terdaftar</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Kapasitas Total</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sections.reduce((total, section) => total + section.kapasitas, 0)}</div>
                            <p className="text-xs text-muted-foreground">Maksimal siswa</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sections List */}
                <div className="grid gap-4">
                    {filteredSections.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">Tidak ada kelas ditemukan</h3>
                                <p className="text-center text-muted-foreground">
                                    {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Anda belum memiliki kelas yang diajar.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredSections.map((section) => (
                            <Card key={section.id} className="transition-shadow hover:shadow-md">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl">{section.subject.nama}</CardTitle>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <span>Kode: {section.subject.kode}</span>
                                                <span>•</span>
                                                <span>
                                                    Periode: {section.term.tahun} - {section.term.semester.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        {getStatusBadge(section.student_count, section.kapasitas)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {section.student_count} / {section.kapasitas} siswa
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>Dibuat: {format(new Date(section.created_at), 'dd MMMM yyyy', { locale: id })}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-start space-x-2 text-sm">
                                                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                <span className="flex-1">{formatJadwal(section.jadwal_json)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Button asChild>
                                            <Link href={`/guru/kelas/${section.id}`}>Lihat Detail</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
