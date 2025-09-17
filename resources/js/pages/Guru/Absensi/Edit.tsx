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

interface User {
    id: number;
    name: string;
    nis: string | null;
}

interface AttendanceDetail {
    id: number;
    user_id: number;
    user: User;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
    note: string | null;
}

interface Attendance {
    id: number;
    section: Section;
    pertemuan_ke: number;
    tanggal: string;
    details: AttendanceDetail[];
}

interface AttendanceUpdateData {
    detail_id: number;
    status: 'hadir' | 'izin' | 'sakit' | 'alpha';
    note: string;
}

interface FormData {
    tanggal: string;
    attendances: AttendanceUpdateData[];
}

interface Props {
    attendance: Attendance;
}

const statusOptions = [
    { value: 'hadir', label: 'Hadir', color: 'bg-green-100 text-green-800' },
    { value: 'izin', label: 'Izin', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'sakit', label: 'Sakit', color: 'bg-blue-100 text-blue-800' },
    { value: 'alpha', label: 'Alpha', color: 'bg-red-100 text-red-800' },
] as const;

export default function Edit({ attendance }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        tanggal: attendance.tanggal,
        attendances: attendance.details.map((detail) => ({
            detail_id: detail.id,
            status: detail.status,
            note: detail.note || '',
        })),
    });

    const handleBack = () => {
        router.visit(route('guru.absensi.show', attendance.id));
    };

    const updateAttendanceStatus = (detailId: number, status: 'hadir' | 'izin' | 'sakit' | 'alpha') => {
        const updatedAttendances = data.attendances.map((attendance) => (attendance.detail_id === detailId ? { ...attendance, status } : attendance));
        setData('attendances', updatedAttendances);
    };

    const updateAttendanceNote = (detailId: number, note: string) => {
        const updatedAttendances = data.attendances.map((attendance) => (attendance.detail_id === detailId ? { ...attendance, note } : attendance));
        setData('attendances', updatedAttendances);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('guru.absensi.update', attendance.id), {
            onSuccess: () => {
                toast.success('Absensi berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui absensi');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusOption = statusOptions.find((option) => option.value === status);
        return statusOption ? statusOption : statusOptions[0];
    };

    return (
        <AppLayout>
            <Head title={`Edit Absensi - ${attendance.section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Edit Absensi</h1>
                            <p className="text-muted-foreground">
                                {attendance.section.subject.nama} - Pertemuan ke-{attendance.pertemuan_ke}
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
                                    <Label>Pertemuan Ke</Label>
                                    <Input value={attendance.pertemuan_ke} disabled className="bg-muted" />
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
                                Daftar Siswa ({attendance.details.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {attendance.details.map((detail, index) => {
                                    const attendanceData = data.attendances.find((a) => a.detail_id === detail.id);
                                    const currentStatus = attendanceData?.status || detail.status;
                                    const statusBadge = getStatusBadge(currentStatus);

                                    return (
                                        <div key={detail.id} className="rounded-lg border p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                            <span className="text-sm font-semibold text-primary">{index + 1}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold">{detail.user.name}</h4>
                                                            {detail.user.nis && (
                                                                <p className="text-sm text-muted-foreground">NIS: {detail.user.nis}</p>
                                                            )}
                                                        </div>
                                                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                                    </div>

                                                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label>Status Kehadiran</Label>
                                                            <Select
                                                                value={currentStatus}
                                                                onValueChange={(value: 'hadir' | 'izin' | 'sakit' | 'alpha') =>
                                                                    updateAttendanceStatus(detail.id, value)
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
                                                                value={attendanceData?.note || ''}
                                                                onChange={(e) => updateAttendanceNote(detail.id, e.target.value)}
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
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
