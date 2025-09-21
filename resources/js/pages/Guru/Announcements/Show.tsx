import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

interface Creator {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface ScopeSection {
    id: number;
    subject: Subject;
}

interface Announcement {
    id: number;
    title: string;
    content: string;
    scope_type: 'global' | 'section' | 'role';
    scope_id?: number;
    role_name?: 'siswa' | 'guru' | 'admin';
    published_at: string;
    created_at: string;
    updated_at: string;
    creator: Creator;
    scope_section?: ScopeSection;
}

interface Props {
    announcement: Announcement;
    userRole: 'siswa' | 'guru' | 'admin';
    canEdit: boolean;
    canDelete: boolean;
}

function getScopeTypeLabel(scopeType: string): string {
    switch (scopeType) {
        case 'global':
            return 'Global';
        case 'section':
            return 'Kelas';
        case 'role':
            return 'Role';
        default:
            return 'Unknown';
    }
}

function getScopeTypeVariant(scopeType: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (scopeType) {
        case 'global':
            return 'destructive';
        case 'section':
            return 'default';
        case 'role':
            return 'secondary';
        default:
            return 'outline';
    }
}

function getScopeDescription(announcement: Announcement): string {
    switch (announcement.scope_type) {
        case 'global':
            return 'Semua pengguna';
        case 'section':
            return announcement.scope_section 
                ? `${announcement.scope_section.subject.kode} - ${announcement.scope_section.subject.nama}`
                : 'Kelas tidak ditemukan';
        case 'role':
            return announcement.role_name 
                ? announcement.role_name.charAt(0).toUpperCase() + announcement.role_name.slice(1)
                : 'Role tidak ditemukan';
        default:
            return 'Target tidak diketahui';
    }
}

export default function Show({ announcement, userRole, canEdit, canDelete }: Props) {
    return (
        <AppLayout>
            <Head title={`Pengumuman: ${announcement.title}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detail Pengumuman</h1>
                        <p className="text-gray-600">Informasi lengkap pengumuman</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Peran Anda: <span className="font-medium">{userRole}</span>
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        {canEdit && (
                            <Link href={route('guru.announcements.edit', announcement.id)}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                        )}
                        {canDelete && (
                            <Link 
                                href={route('guru.announcements.destroy', announcement.id)} 
                                method="delete"
                                as="button"
                                onBefore={() => confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')}
                            >
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Hapus
                                </Button>
                            </Link>
                        )}
                        <Link href={route('guru.announcements.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Badge variant={getScopeTypeVariant(announcement.scope_type)}>
                                        {getScopeTypeLabel(announcement.scope_type)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Target: {getScopeDescription(announcement)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Dibuat oleh: <span className="font-medium">{announcement.creator.name}</span>
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2">Isi Pengumuman</h3>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap text-gray-700">{announcement.content}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-900">Tanggal Dibuat:</span>
                                    <p className="text-gray-600">
                                        {format(new Date(announcement.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Terakhir Diperbarui:</span>
                                    <p className="text-gray-600">
                                        {format(new Date(announcement.updated_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                    </p>
                                </div>
                                {announcement.published_at && (
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-gray-900">Tanggal Publikasi:</span>
                                        <p className="text-gray-600">
                                            {format(new Date(announcement.published_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}