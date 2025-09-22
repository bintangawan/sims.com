import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, PageProps, router } from '@inertiajs/react';
import { Download } from 'lucide-react';

interface Term {
    id: number;
    tahun: string;
    semester: string;
    aktif: boolean;
}

interface Subject {
    id: number;
    nama: string;
    kode?: string;
}

interface User {
    id: number;
    name: string;
}

interface Guru {
    user: User;
}

interface Section {
    id: number;
    guru: Guru;
}

interface Assignment {
    id: number;
    judul: string;
}

interface Grade {
    id: number;
    section: Section;
    assignment: Assignment;
    grade: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Bentuk paginator bisa:
 * 1) "datar" (from/to/total/links di top-level), ATAU
 * 2) "API-style" (meta.{from,to,total,links})
 * Kita buat tipe longgar agar komponen tahan keduanya.
 */
interface AnyPaginator<T> {
    data: T[];
    // flat shape
    current_page?: number;
    last_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    links?: PaginationLink[];

    // meta shape
    meta?: {
        current_page?: number;
        last_page?: number;
        from?: number;
        to?: number;
        total?: number;
        links?: PaginationLink[];
    };
}

interface Statistics {
    total_grades: number;
    average_grade: number;
    highest_grade: number;
    lowest_grade: number;
}

interface BySubjectProps extends PageProps {
    subject: Subject;
    grades: AnyPaginator<Grade>;
    statistics: Statistics;
    terms: Term[];
    currentTerm: Term | null;
    selectedTermId: number;
}

export default function BySubject({ subject, grades, statistics, terms, currentTerm, selectedTermId }: BySubjectProps) {
    // Pastikan value Select valid (tidak pernah string kosong)
    const selectedValue =
        terms.find((t) => t.id === selectedTermId)?.id.toString() ?? (terms[0]?.id !== undefined ? terms[0].id.toString() : undefined);

    // Helper untuk ambil paginasi yang mungkin ada di meta atau flat
    const pageFrom = grades.meta?.from ?? grades.from ?? 0;
    const pageTo = grades.meta?.to ?? grades.to ?? grades.data.length ?? 0;
    const pageTotal = grades.meta?.total ?? grades.total ?? grades.data.length ?? 0;
    const pageLinks: PaginationLink[] = (grades.meta?.links ?? grades.links ?? []) as PaginationLink[];

    const handleTermChange = (value: string) => {
        router.get(route('siswa.nilai.by-subject', { subject: subject.id }), { term_id: value }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = route('siswa.nilai.export', {
            term_id: selectedTermId,
            class_id: subject.id, // controller kamu baca sebagai class_id (subject id)
        });
    };

    const getGradeColor = (grade: number): string => {
        if (grade >= 85) return 'bg-green-500';
        if (grade >= 70) return 'bg-blue-500';
        if (grade >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <AppLayout>
            <Head title={`Nilai - ${subject.nama}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-800">{subject.nama}</h2>
                                    <p className="text-gray-600">{subject.kode ?? ''}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Semester:</span>
                                        <Select value={selectedValue} onValueChange={handleTermChange}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Pilih Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {terms.map((term) => (
                                                    <SelectItem key={term.id} value={term.id.toString()}>
                                                        {term.tahun} - {term.semester}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center space-x-1">
                                        <Download className="h-4 w-4" />
                                        <span>Export Excel</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Statistics Cards */}
                            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.average_grade}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Nilai Tertinggi</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.highest_grade}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Nilai Terendah</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.lowest_grade}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{statistics.total_grades}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Grades Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Daftar Nilai</CardTitle>
                                    <CardDescription>
                                        Semester {currentTerm ? `${currentTerm.tahun} - ${currentTerm.semester}` : 'Aktif'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-500">
                                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3">
                                                        Tugas
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Guru
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Tanggal
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Nilai
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {grades.data.map((grade) => (
                                                    <tr key={grade.id} className="border-b bg-white hover:bg-gray-50">
                                                        <td className="px-6 py-4 font-medium text-gray-900">{grade.assignment.judul}</td>
                                                        <td className="px-6 py-4">{grade.section.guru.user.name}</td>
                                                        <td className="px-6 py-4">{new Date(grade.created_at).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant="outline" className={getGradeColor(grade.grade)}>
                                                                {grade.grade}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {pageFrom} hingga {pageTo} dari {pageTotal} hasil
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {pageLinks.map((link, i) => (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="mx-1"
                                                    disabled={!link.url}
                                                    onClick={() => {
                                                        if (link.url) router.visit(link.url);
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
