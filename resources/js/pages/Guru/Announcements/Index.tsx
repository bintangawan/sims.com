import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Edit, Eye, Filter, Plus, Trash2 } from 'lucide-react';
import { ReactNode, useState } from 'react';

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

interface PaginatedData {
    data: Announcement[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Filters {
    scope_type?: string;
}

interface Props {
    announcements: PaginatedData;
    userRole: string;
    filters: Filters;
}

/* ──────────────────────────────────────────────────────────────────────────────
   ConfirmDeleteDialog — sama gaya dengan Users/Index.tsx (ketik HAPUS + centang)
   ──────────────────────────────────────────────────────────────────────────── */
type ConfirmDeleteDialogProps = {
    trigger: ReactNode;
    title: string;
    description?: string;
    confirmWord?: string; // default: "HAPUS"
    onConfirm: () => void;
    isLoading?: boolean;
};

function ConfirmDeleteDialog({
    trigger,
    title,
    description = 'Tindakan ini permanen dan tidak dapat dibatalkan.',
    confirmWord = 'HAPUS',
    onConfirm,
    isLoading,
}: ConfirmDeleteDialogProps) {
    const [typed, setTyped] = useState('');
    const [agreed, setAgreed] = useState(false);

    const canSubmit = typed.trim().toUpperCase() === confirmWord && agreed && !isLoading;

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent className="rounded-2xl border shadow-xl sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                        Ketik <span className="font-semibold text-foreground">{confirmWord}</span> untuk konfirmasi:
                    </div>
                    <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={confirmWord} />

                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
                        <span>Saya paham data yang dihapus tidak dapat dikembalikan.</span>
                    </label>
                </div>

                <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel className={`${buttonVariants({ variant: 'outline' })} rounded-xl`}>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={!canSubmit}
                        onClick={onConfirm}
                        className={`${buttonVariants({ variant: 'destructive' })} gap-2 rounded-xl`}
                    >
                        <Trash2 className="h-4 w-4" />
                        {isLoading ? 'Menghapus...' : 'Hapus'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/* ──────────────────────────────────────────────────────────────────────────── */

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

export default function Index({ announcements, userRole, filters }: Props) {
    const [scopeTypeFilter, setScopeTypeFilter] = useState(filters.scope_type || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (scopeTypeFilter) params.scope_type = scopeTypeFilter;

        router.get(route('guru.announcements.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilter = () => {
        setScopeTypeFilter('');
        router.get(route('guru.announcements.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = (id: number) => {
        setDeletingId(id);
        router.delete(route('guru.announcements.destroy', id), {
            onFinish: () => setDeletingId(null),
        });
    };

    return (
        <AppLayout>
            <Head title="Kelola Pengumuman" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kelola Pengumuman</h1>
                        <p className="text-gray-600">Kelola pengumuman untuk siswa dan guru</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Peran Anda: <span className="font-medium">{userRole}</span>
                        </p>
                    </div>
                    <Link href={route('guru.announcements.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Pengumuman
                        </Button>
                    </Link>
                </div>

                {/* Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter Pengumuman
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Scope</label>
                                <Select value={scopeTypeFilter} onValueChange={setScopeTypeFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe scope" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="section">Kelas</SelectItem>
                                        <SelectItem value="role">Role</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} variant="outline">
                                    Terapkan Filter
                                </Button>
                                <Button onClick={handleClearFilter} variant="ghost">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Announcements Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Scope</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Dibuat Oleh</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Publikasi</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                                            Tidak ada pengumuman ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    announcements.data.map((announcement) => {
                                        const isPublished = announcement.published_at && new Date(announcement.published_at) <= new Date();
                                        const isFuturePublished = announcement.published_at && new Date(announcement.published_at) > new Date();
                                        
                                        return (
                                            <TableRow key={announcement.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{announcement.title}</div>
                                                        <div className="max-w-xs truncate text-sm text-gray-500">
                                                            {announcement.content.substring(0, 100)}...
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getScopeTypeVariant(announcement.scope_type)}>
                                                        {getScopeTypeLabel(announcement.scope_type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{getScopeDescription(announcement)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">{announcement.creator.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={
                                                            isPublished ? 'default' : 
                                                            isFuturePublished ? 'secondary' : 
                                                            'outline'
                                                        }
                                                    >
                                                        {isPublished ? 'Dipublikasi' : 
                                                         isFuturePublished ? 'Terjadwal' : 
                                                         'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {announcement.published_at ? 
                                                            format(new Date(announcement.published_at), 'dd MMM yyyy HH:mm', { locale: idLocale }) :
                                                            '-'
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={route('guru.announcements.show', announcement.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('guru.announcements.edit', announcement.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>

                                                        {/* Dialog hapus — versi ConfirmDeleteDialog */}
                                                        <ConfirmDeleteDialog
                                                            trigger={
                                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            title={`Hapus Pengumuman "${announcement.title}"?`}
                                                            description="Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini tidak dapat dibatalkan."
                                                            confirmWord="HAPUS"
                                                            onConfirm={() => handleDelete(announcement.id)}
                                                            isLoading={deletingId === announcement.id}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {announcements.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {announcements.links.map((link, index) => {
                                if (link.url === null) {
                                    return <Button key={index} variant="ghost" disabled dangerouslySetInnerHTML={{ __html: link.label }} />;
                                }
                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'ghost'}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}