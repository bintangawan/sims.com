import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, PageProps, router } from '@inertiajs/react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface Term {
    id: number;
    tahun: string;
    semester: string;
    aktif: boolean;
}

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface User {
    id: number;
    name: string;
}

interface Guru {
    id: number;
    user: User;
}

interface Section {
    id: number;
    subject: Subject;
    guru: Guru;
}

interface Assignment {
    id: number;
    title: string;
}

interface Grade {
    id: number;
    section: Section;
    assignment: Assignment;
    grade: number;
    created_at: string;
}

interface SubjectSummary {
    subject_name: string;
    total_grades: number;
    average_grade: number;
    latest_grade: Grade;
    grades: Grade[];
}

interface NilaiIndexProps extends PageProps {
    subjectSummary: Record<string, SubjectSummary>;
    overallGPA: number;
    totalGrades: number;
    terms: Term[];
    currentTerm: Term;
    selectedTermId: number;
    subjects: Subject[];
}

export default function Index({ subjectSummary, overallGPA, totalGrades, terms, currentTerm, selectedTermId, subjects }: NilaiIndexProps) {
    // value Select semester harus valid (kecocokan dengan salah satu item)
    const selectedValue =
        terms.find((t) => t.id === selectedTermId)?.id.toString() ?? (terms[0]?.id !== undefined ? terms[0].id.toString() : undefined);

    const handleTermChange = (value: string) => {
        router.get(route('siswa.nilai.index'), { term_id: value });
    };

    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportType, setExportType] = useState<'all' | 'by_class'>('all');
    const [exportClassId, setExportClassId] = useState<string>('');

    const handleExport = () => {
        setExportDialogOpen(true);
    };

    const executeExport = () => {
        const params: Record<string, string | number> = { term_id: selectedTermId };
        if (exportType === 'by_class' && exportClassId) {
            params.class_id = exportClassId;
        }
        window.location.href = route('siswa.nilai.export', params);
        setExportDialogOpen(false);
    };

    const getGradeColor = (grade: number): string => {
        if (grade >= 85) return 'bg-green-500';
        if (grade >= 70) return 'bg-blue-500';
        if (grade >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <AppLayout>
            <Head title="Nilai Saya" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-800">Nilai Saya</h2>
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

                                    <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Export Nilai</DialogTitle>
                                                <DialogDescription>Pilih opsi export nilai yang diinginkan</DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-4 py-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="exportType">Opsi Export</Label>
                                                    <Select
                                                        value={exportType}
                                                        onValueChange={(value: string) => setExportType(value as 'all' | 'by_class')}
                                                    >
                                                        <SelectTrigger id="exportType">
                                                            <SelectValue placeholder="Pilih opsi" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">Semua Nilai</SelectItem>
                                                            <SelectItem value="by_class">Berdasarkan Mata Pelajaran</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {exportType === 'by_class' && (
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="class">Pilih Mata Pelajaran</Label>
                                                        <Select value={exportClassId} onValueChange={(value: string) => setExportClassId(value)}>
                                                            <SelectTrigger id="class">
                                                                <SelectValue placeholder="Pilih mata pelajaran" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {subjects.map((subject) => (
                                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                                        {subject.nama}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>

                                            <DialogFooter>
                                                <Button type="button" onClick={() => setExportDialogOpen(false)} variant="outline">
                                                    Batal
                                                </Button>
                                                <Button type="button" onClick={executeExport} className="flex items-center gap-2">
                                                    <FileSpreadsheet className="h-4 w-4" />
                                                    Export
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {/* Overview Card */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Ringkasan Nilai</CardTitle>
                                    <CardDescription>Semester {currentTerm?.semester || 'Aktif'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <p className="text-sm text-gray-500">Rata-rata Nilai</p>
                                            <p className="text-3xl font-bold">{overallGPA}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <p className="text-sm text-gray-500">Total Nilai</p>
                                            <p className="text-3xl font-bold">{totalGrades}</p>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-4">
                                            <p className="text-sm text-gray-500">Mata Pelajaran</p>
                                            <p className="text-3xl font-bold">{subjects.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Subject Cards */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {Object.entries(subjectSummary).map(([subjectName, data]) => (
                                    <Card key={subjectName}>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>{subjectName}</CardTitle>
                                                    <CardDescription>Rata-rata: {data.average_grade}</CardDescription>
                                                </div>
                                                <Badge variant="default" className={getGradeColor(data.average_grade)}>
                                                    {data.average_grade}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {data.grades.map((grade) => (
                                                    <div key={grade.id} className="flex items-center justify-between rounded bg-gray-50 p-2">
                                                        <div>
                                                            <p className="font-medium">{grade.assignment.title}</p>
                                                            <p className="text-sm text-gray-500">{new Date(grade.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <Badge variant="outline" className={getGradeColor(grade.grade)}>
                                                            {grade.grade}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                <Link
                                                    href={route('siswa.nilai.by-subject', data.latest_grade.section.subject.id)}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Lihat semua nilai &rarr;
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
