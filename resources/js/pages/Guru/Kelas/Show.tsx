import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, BookOpen, Calendar, CheckSquare, Clock, Download, Mail, Menu, Plus, Search, User, UserPlus, Users } from 'lucide-react';
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

interface Student {
    id: number;
    name: string;
    email: string;
    nis?: string;
    angkatan?: number;
    kelas?: string;
}

interface Section {
    id: number;
    subject: Subject;
    term: Term;
    kapasitas: number;
    jadwal_json: JadwalItem[];
    students: Student[];
    created_at: string;
}

interface Props {
    section: Section;
}

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

export default function KelasShow({ section }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/guru/dashboard',
        },
        {
            title: 'Kelas',
            href: '/guru/kelas',
        },
        {
            title: section.subject.nama,
            href: `/guru/kelas/${section.id}`,
        },
    ];

    const filteredStudents = section.students.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.nis && student.nis.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelas ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                <Button variant="outline" asChild className="gap-2">
                    <Link href="/guru/kelas">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali</span>
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{section.subject.nama}</h1>
                            <p className="text-muted-foreground">
                                Kode: {section.subject.kode} • Periode: {section.term.tahun} - {section.term.semester.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {/* Desktop Actions - Hidden on mobile */}
                    <div className="hidden items-center space-x-2 md:flex">
                        <div className="flex gap-3">
                            <Link
                                href={route('guru.kelas.create', section.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase ring-blue-300 transition duration-150 ease-in-out hover:bg-blue-700 focus:border-blue-900 focus:ring focus:outline-none active:bg-blue-900 disabled:opacity-25"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Tambah Siswa
                            </Link>

                            <Link
                                href={route('guru.materi.index', section.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase ring-green-300 transition duration-150 ease-in-out hover:bg-green-700 focus:border-green-900 focus:ring focus:outline-none active:bg-green-900 disabled:opacity-25"
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                Kelola Materi
                            </Link>

                            <Link
                                href={route('guru.tugas.index', { section: section.id, section_id: section.id })}
                                className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase ring-purple-300 transition duration-150 ease-in-out hover:bg-purple-700 focus:border-purple-900 focus:ring focus:outline-none active:bg-purple-900 disabled:opacity-25"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Kelola Tugas
                            </Link>

                            <Link
                                href={route('guru.absensi.index', section.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase ring-yellow-300 transition duration-150 ease-in-out hover:bg-yellow-700 focus:border-yellow-900 focus:ring focus:outline-none active:bg-yellow-900 disabled:opacity-25"
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Kelola Absensi
                            </Link>

                            <Link
                                href={route('guru.kelas.export', section.id)}
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-xs font-semibold tracking-widest text-white uppercase ring-gray-300 transition duration-150 ease-in-out hover:bg-gray-700 focus:border-gray-900 focus:ring focus:outline-none active:bg-gray-900 disabled:opacity-25"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export CSV
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Hamburger Menu - Visible only on mobile */}
                    <div className="md:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-4 w-4" />
                                    <span className="sr-only">Menu aksi</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem asChild>
                                    <Link href={route('guru.kelas.create', section.id)} className="flex w-full items-center">
                                        <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                                        <span>Tambah Siswa</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href={route('guru.materi.index', section.id)} className="flex w-full items-center">
                                        <BookOpen className="mr-2 h-4 w-4 text-green-600" />
                                        <span>Kelola Materi</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link
                                        href={route('guru.materi.create', { section: section.id, section_id: section.id })}
                                        className="flex w-full items-center"
                                    >
                                        <Plus className="mr-2 h-4 w-4 text-purple-600" />
                                        <span>Kelola Tugas</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href={route('guru.absensi.index', section.id)} className="flex w-full items-center">
                                        <Calendar className="mr-2 h-4 w-4 text-yellow-600" />
                                        <span>Kelola Absensi</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuItem asChild>
                                    <Link href={route('guru.kelas.export', section.id)} className="flex w-full items-center">
                                        <Download className="mr-2 h-4 w-4 text-gray-600" />
                                        <span>Export CSV</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Section Info Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{section.students.length}</div>
                            <p className="text-xs text-muted-foreground">dari {section.kapasitas} kapasitas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status Kelas</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-y-1">{getStatusBadge(section.students.length, section.kapasitas)}</div>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {Math.round((section.students.length / section.kapasitas) * 100)}% terisi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Absensi</CardTitle>
                            <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">
                                <Link href={`/guru/kelas/${section.id}/absensi`} className="text-blue-600 hover:underline">
                                    Kelola absensi
                                </Link>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Jadwal</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">{formatJadwal(section.jadwal_json)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Dibuat</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">{format(new Date(section.created_at), 'dd MMM yyyy', { locale: id })}</div>
                            <p className="text-xs text-muted-foreground">{format(new Date(section.created_at), 'HH:mm', { locale: id })}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Students Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Daftar Siswa</CardTitle>
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari siswa..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-64 pl-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">
                                    {searchTerm ? 'Tidak ada siswa ditemukan' : 'Belum ada siswa terdaftar'}
                                </h3>
                                <p className="text-center text-muted-foreground">
                                    {searchTerm
                                        ? 'Coba ubah kata kunci pencarian Anda.'
                                        : 'Siswa akan muncul di sini setelah mendaftar ke kelas ini.'}
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>NIS</TableHead>
                                            <TableHead>Nama Lengkap</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Angkatan</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead className="w-24">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.map((student, index) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>{student.nis || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{student.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{student.angkatan || '-'}</TableCell>
                                                <TableCell>{student.kelas || '-'}</TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">
                                                        Detail
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
