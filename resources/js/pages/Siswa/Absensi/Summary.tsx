import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, PageProps, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

/* ===================== Types ===================== */
interface Term {
    id: number;
    nama: string;
    tahun: number;
    aktif: boolean;
}

interface MonthlyAttendance {
    month: string;
    present: number;
    absent: number;
    excused: number;
    total: number;
}

interface WeeklyAttendance {
    week: string | number;
    present: number;
    absent: number;
    excused: number;
    total: number;
}

interface SummaryProps extends PageProps {
    monthlyAttendance: MonthlyAttendance[];
    weeklyAttendance: WeeklyAttendance[];
    terms: Term[];
    currentTerm: Term | null;
    selectedTermId: number | null;
}

/* ===================== Helpers ===================== */
const calculatePercentage = (present: number, total: number): number => {
    if (!total) return 0;
    return Math.round((present / total) * 100);
};

/* ===================== Component ===================== */
export default function Summary({ monthlyAttendance, weeklyAttendance, terms, currentTerm, selectedTermId }: SummaryProps) {
    // Pastikan Select selalu controlled (string)
    const initialTermStr = useMemo(() => {
        const fallbackId = selectedTermId ?? currentTerm?.id ?? (terms.length > 0 ? terms[0].id : null);
        return fallbackId !== null && fallbackId !== undefined ? String(fallbackId) : '';
    }, [selectedTermId, currentTerm, terms]);

    const [termId, setTermId] = useState<string>(initialTermStr);

    useEffect(() => {
        if (!termId && terms.length > 0) {
            setTermId(String(terms[0].id));
        }
    }, [terms, termId]);

    const handleFilter = () => {
        if (termId) {
            router.get(route('siswa.absensi.summary'), { term_id: termId }, { preserveState: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Ringkasan Absensi" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('siswa.absensi.index')}>
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Ringkasan Absensi</h2>
                            <p className="text-sm text-muted-foreground">
                                {currentTerm
                                    ? `Semester ${currentTerm.nama} ${currentTerm.tahun}${currentTerm.aktif ? ' (Aktif)' : ''}`
                                    : 'Semester Aktif'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter</CardTitle>
                        <CardDescription>Filter data absensi berdasarkan semester</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <label className="text-sm font-medium">Semester</label>
                                <Select value={termId} onValueChange={setTermId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {terms.map((term) => (
                                            <SelectItem key={term.id} value={String(term.id)}>
                                                {term.nama} {term.tahun}
                                                {term.aktif ? ' (Aktif)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleFilter}>Terapkan Filter</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Monthly and Weekly */}
                <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                        <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                    </TabsList>

                    {/* Monthly Tab Content */}
                    <TabsContent value="monthly">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Bulanan</CardTitle>
                                <CardDescription>Statistik kehadiran 6 bulan terakhir</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {monthlyAttendance.length > 0 ? (
                                    <div className="rounded-md border">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Bulan
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Hadir
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Alpha
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Izin/Sakit
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Total
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Persentase
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {monthlyAttendance.map((m, i) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{m.month}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{m.present}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{m.absent}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{m.excused}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{m.total}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{calculatePercentage(m.present, m.total)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <p>Tidak ada data absensi bulanan yang ditemukan.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Weekly Tab Content */}
                    <TabsContent value="weekly">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan Mingguan</CardTitle>
                                <CardDescription>Statistik kehadiran mingguan bulan ini</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {weeklyAttendance.length > 0 ? (
                                    <div className="rounded-md border">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Minggu
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Hadir
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Alpha
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Izin/Sakit
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Total
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                                        Persentase
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {weeklyAttendance.map((w, i) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4 whitespace-nowrap">{w.week}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{w.present}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{w.absent}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{w.excused}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{w.total}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{calculatePercentage(w.present, w.total)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <p>Tidak ada data absensi mingguan yang ditemukan.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
