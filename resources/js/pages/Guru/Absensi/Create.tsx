import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
// import { id } from 'date-fns/locale';
import { ArrowLeft, Calendar, Save, Users } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Section {
    id: number;
    subject: Subject;
}

interface Student {
    id: number;
    name: string;
    nis: string | null;
}

interface AttendanceData {
    user_id: number;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
    note: string;
}

interface FormData {
    pertemuan_ke: number;
    tanggal: string;
    attendances: AttendanceData[];
}

interface Props {
    section: Section;
    students: Student[];
    next_meeting: number;
}

const statusOptions = [
    { value: 'hadir', label: 'Hadir', color: 'bg-green-100 text-green-800' },
    { value: 'izin', label: 'Izin', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'sakit', label: 'Sakit', color: 'bg-blue-100 text-blue-800' },
    { value: 'alpha', label: 'Alpha', color: 'bg-red-100 text-red-800' },
] as const;

export default function Create({ section, students, next_meeting }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        pertemuan_ke: next_meeting,
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        attendances: students.map((student) => ({
            user_id: student.id,
            status: 'hadir' as const,
            note: '',
        })),
    });

    const handleBack = () => {
        router.visit(route('guru.absensi.index', section.id));
    };

    const updateAttendanceStatus = (studentId: number, status: 'hadir' | 'izin' | 'sakit' | 'alpha') => {
        const updatedAttendances = data.attendances.map((attendance) => (attendance.user_id === studentId ? { ...attendance, status } : attendance));
        setData('attendances', updatedAttendances);
    };

    const updateAttendanceNote = (studentId: number, note: string) => {
        const updatedAttendances = data.attendances.map((attendance) => (attendance.user_id === studentId ? { ...attendance, note } : attendance));
        setData('attendances', updatedAttendances);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('guru.absensi.store', section.id), {
            onSuccess: () => {
                toast.success('Absensi berhasil disimpan');
            },
            onError: () => {
                toast.error('Gagal menyimpan absensi');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusOption = statusOptions.find((option) => option.value === status);
        return statusOption ? statusOption : statusOptions[0];
    };

    return (
        <AppLayout>
            <Head title={`Buat Absensi - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Buat Absensi Baru</h1>
                            <p className="text-muted-foreground">
                                {section.subject.nama} - {section.subject.kode}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Form Header */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Informasi Absensi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pertemuan_ke">Pertemuan Ke</Label>
                                    <Input
                                        id="pertemuan_ke"
                                        type="number"
                                        min="1"
                                        value={data.pertemuan_ke}
                                        onChange={(e) => setData('pertemuan_ke', parseInt(e.target.value) || 1)}
                                        className={errors.pertemuan_ke ? 'border-red-500' : ''}
                                    />
                                    {errors.pertemuan_ke && <p className="text-sm text-red-500">{errors.pertemuan_ke}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggal">Tanggal</Label>
                                    <Input
                                        id="tanggal"
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        max={format(new Date(), 'yyyy-MM-dd')}
                                        className={errors.tanggal ? 'border-red-500' : ''}
                                    />
                                    {errors.tanggal && <p className="text-sm text-red-500">{errors.tanggal}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Students Attendance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Daftar Siswa ({students.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {students.map((student, index) => {
                                    const attendance = data.attendances.find((a) => a.user_id === student.id);
                                    const currentStatus = attendance?.status || 'hadir';
                                    const statusBadge = getStatusBadge(currentStatus);

                                    return (
                                        <div key={student.id} className="rounded-lg border p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                            <span className="text-sm font-semibold text-primary">{index + 1}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{student.name}</h4>
                                                            {student.nis && <p className="text-sm text-muted-foreground">NIS: {student.nis}</p>}
                                                        </div>
                                                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Status Kehadiran</Label>
                                                            <Select
                                                                value={currentStatus}
                                                                onValueChange={(value: 'hadir' | 'izin' | 'sakit' | 'alpha') =>
                                                                    updateAttendanceStatus(student.id, value)
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {statusOptions.map((option) => (
                                                                        <SelectItem key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Catatan (Opsional)</Label>
                                                            <Textarea
                                                                placeholder="Tambahkan catatan..."
                                                                value={attendance?.note || ''}
                                                                onChange={(e) => updateAttendanceNote(student.id, e.target.value)}
                                                                rows={2}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={handleBack}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Absensi'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
