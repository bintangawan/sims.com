import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string | null;
}

interface Guru {
    id: number;
    user_id: number;
    name: string; // Section.guru mengarah ke User langsung, jadi cukup name
}

interface Term {
    id: number;
    nama: string;
    tahun_ajaran: string;
    aktif: boolean;
}

interface Section {
    id: number;
    subject_id: number;
    guru_id: number;
    term_id: number;
    kapasitas: number | null;
    subject: Subject;
    guru: Guru;
    term: Term;
}

interface JadwalItem {
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    ruangan: string;
}

interface ScheduleItem {
    section: Section;
    jadwal: JadwalItem;
}

interface Props {
    schedule: Record<number, ScheduleItem[]>;
    dayNames: Record<number, string>;
}

const Jadwal: React.FC<Props> = ({ schedule, dayNames }) => {
    const formatTime = (time: string) => time.substring(0, 5);

    const getStatusBadge = (jadwal: JadwalItem) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = jadwal.jam_mulai.split(':').map(Number);
        const [eh, em] = jadwal.jam_selesai.split(':').map(Number);
        const startTime = sh * 60 + sm;
        const endTime = eh * 60 + em;

        if (currentTime < startTime) return <Badge variant="outline">Akan Datang</Badge>;
        if (currentTime <= endTime)
            return (
                <Badge variant="default" className="bg-green-500">
                    Sedang Berlangsung
                </Badge>
            );
        return <Badge variant="secondary">Selesai</Badge>;
    };

    const renderScheduleCard = (item: ScheduleItem) => (
        <Card key={`${item.section.id}-${item.jadwal.jam_mulai}`} className="mb-4">
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{item.section.subject.nama}</h3>
                            {getStatusBadge(item.jadwal)}
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{item.section.guru.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {formatTime(item.jadwal.jam_mulai)} - {formatTime(item.jadwal.jam_selesai)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{item.jadwal.ruangan}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                            {item.section.subject.kode}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const renderFullSchedule = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Jadwal Lengkap</h2>

            {Object.keys(schedule).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(dayNames).map(([dayNumber, dayName]) => {
                        const dayIdx = parseInt(dayNumber, 10);
                        const daySchedule = schedule[dayIdx] || [];

                        return (
                            <Card key={dayNumber}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        {dayName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {daySchedule.length > 0 ? (
                                        <div className="space-y-4">{daySchedule.map((item) => renderScheduleCard(item))}</div>
                                    ) : (
                                        <p className="py-4 text-center text-muted-foreground">Tidak ada jadwal untuk hari {dayName.toLowerCase()}</p>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center">
                        <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 font-semibold">Belum ada jadwal</h3>
                        <p className="text-muted-foreground">Anda belum terdaftar dalam kelas manapun atau jadwal belum tersedia.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    return (
        <AppLayout>
            <Head title="Jadwal Kelas" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Jadwal Kelas</h1>
                        <p className="text-muted-foreground">Lihat jadwal kelas dan mata pelajaran Anda</p>
                    </div>
                </div>

                {/* Hanya “Semua Jadwal” */}
                {renderFullSchedule()}
            </div>
        </AppLayout>
    );
};

export default Jadwal;
