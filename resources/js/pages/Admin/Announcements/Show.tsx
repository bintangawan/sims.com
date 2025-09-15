import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ArrowLeft, Calendar, Edit, User } from 'lucide-react';

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
    role_name?: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    creator: Creator;
    scope_section?: ScopeSection;
}

interface Props {
    announcement: Announcement;
    userRole: string;
}

const getScopeTypeLabel = (scopeType: string) => {
    switch (scopeType) {
        case 'global':
            return 'Global';
        case 'section':
            return 'Kelas';
        case 'role':
            return 'Role';
        default:
            return scopeType;
    }
};

const getScopeTypeVariant = (scopeType: string) => {
    switch (scopeType) {
        case 'global':
            return 'default';
        case 'section':
            return 'secondary';
        case 'role':
            return 'outline';
        default:
            return 'default';
    }
};

const getScopeDescription = (announcement: Announcement) => {
    switch (announcement.scope_type) {
        case 'global':
            return 'Semua pengguna';
        case 'role':
            return `Role: ${announcement.role_name}`;
        case 'section':
            return announcement.scope_section
                ? `${announcement.scope_section.subject.kode} - ${announcement.scope_section.subject.nama}`
                : 'Kelas tidak ditemukan';
        default:
            return '-';
    }
};

export default function Show({ announcement }: Props) {
    return (
        <AppLayout>
            <Head title={`Pengumuman: ${announcement.title}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detail Pengumuman</h1>
                        <p className="text-gray-600">Informasi lengkap pengumuman</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('admin.announcements.edit', announcement.id)}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Link href={route('admin.announcements.index')}>
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
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <User className="h-4 w-4" />
                                        <span>{announcement.creator.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {format(new Date(announcement.published_at), 'dd MMMM yyyy, HH:mm', {
                                                locale: idLocale,
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Badge variant={getScopeTypeVariant(announcement.scope_type)}>{getScopeTypeLabel(announcement.scope_type)}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Target Information */}
                            <div>
                                <h3 className="mb-2 font-medium text-gray-900">Target Pengumuman</h3>
                                <p className="text-gray-600">{getScopeDescription(announcement)}</p>
                            </div>

                            <Separator />

                            {/* Content */}
                            <div>
                                <h3 className="mb-4 font-medium text-gray-900">Isi Pengumuman</h3>
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700">{announcement.content}</div>
                                </div>
                            </div>

                            <Separator />

                            {/* Metadata */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-gray-900">Dibuat pada</h4>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(announcement.created_at), 'dd MMMM yyyy, HH:mm', {
                                            locale: idLocale,
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="mb-1 text-sm font-medium text-gray-900">Terakhir diperbarui</h4>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(announcement.updated_at), 'dd MMMM yyyy, HH:mm', {
                                            locale: idLocale,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
