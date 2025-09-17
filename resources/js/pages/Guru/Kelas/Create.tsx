import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import React from 'react';

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

interface Section {
    id: number;
    subject: Subject;
    term: Term;
    kapasitas: number;
    current_student_count: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    nis?: string;
    angkatan?: number;
    kelas?: string;
}

interface Props {
    section: Section;
    availableStudents: Student[];
}

export default function KelasCreate({ section, availableStudents }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
    });

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
        {
            title: 'Tambah Siswa',
            href: `/guru/kelas/${section.id}/create`,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('guru.kelas.store', section.id));
    };

    const remainingCapacity = section.kapasitas - section.current_student_count;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Siswa - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={`/guru/kelas/${section.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Tambah Siswa
                            </h1>
                            <p className="text-muted-foreground">
                                {section.subject.nama} • {section.term.tahun} - {section.term.semester.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Informasi Kelas</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Siswa Terdaftar</Label>
                                <p className="text-2xl font-bold">{section.current_student_count}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Kapasitas Maksimum</Label>
                                <p className="text-2xl font-bold">{section.kapasitas}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Sisa Kapasitas</Label>
                                <p className={`text-2xl font-bold ${
                                    remainingCapacity > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {remainingCapacity}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Student Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <UserPlus className="h-5 w-5" />
                            <span>Daftarkan Siswa</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {remainingCapacity <= 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Kelas Sudah Penuh</h3>
                                <p className="text-muted-foreground">
                                    Kelas ini sudah mencapai kapasitas maksimum. Tidak dapat menambah siswa lagi.
                                </p>
                            </div>
                        ) : availableStudents.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Tidak Ada Siswa Tersedia</h3>
                                <p className="text-muted-foreground">
                                    Semua siswa sudah terdaftar di kelas ini atau tidak ada siswa yang tersedia.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">Pilih Siswa</Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => setData('user_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih siswa yang akan didaftarkan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStudents.map((student) => (
                                                <SelectItem key={student.id} value={student.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{student.name}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {student.nis ? `NIS: ${student.nis}` : 'Tanpa NIS'} • 
                                                            {student.kelas || 'Tanpa Kelas'} • 
                                                            {student.email}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.user_id && (
                                        <p className="text-sm text-red-600">{errors.user_id}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-4">
                                    <Button type="submit" disabled={processing || !data.user_id}>
                                        {processing ? 'Mendaftarkan...' : 'Daftarkan Siswa'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={`/guru/kelas/${section.id}`}>
                                            Batal
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}