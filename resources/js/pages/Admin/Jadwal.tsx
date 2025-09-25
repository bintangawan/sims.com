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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import AppLayout from '@/layouts/app-layout';
import { SharedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { toast } from 'sonner';

/* ===================== Types ===================== */
interface ScheduleItem {
    hari: 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | '';
    jam_mulai: string; // "HH:mm"
    jam_selesai: string; // "HH:mm"
    ruangan: string;
}

interface Term {
    id: number;
    nama: string;
    tahun: string;
    aktif: boolean;
}

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Guru {
    id: number;
    name: string;
}

interface Section {
    id: number;
    subject: Subject;
    guru: Guru;
    term: Term;
    kapasitas: number;
    jadwal_json: ScheduleItem[];
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string; // bisa "&laquo;" atau angka string
    active: boolean;
}

/** Bentuk standar paginator Laravel (tanpa meta wrapper) */
interface LaravelPaginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: PaginationLink[];
    // properti lain diabaikan
}

interface Props extends SharedData {
    sections: LaravelPaginator<Section>;
    terms: Term[];
    subjects: Subject[];
    gurus: Guru[];
    activeTerm: Term;
    filters: {
        search?: string;
        term_id?: string;
    };
}

const DAYS: Array<{ value: ScheduleItem['hari']; label: string }> = [
    { value: 'senin', label: 'Senin' },
    { value: 'selasa', label: 'Selasa' },
    { value: 'rabu', label: 'Rabu' },
    { value: 'kamis', label: 'Kamis' },
    { value: 'jumat', label: 'Jumat' },
    { value: 'sabtu', label: 'Sabtu' },
];

/* ===================== Confirm Delete ===================== */
type ConfirmDeleteDialogProps = {
    trigger: ReactNode;
    title: string;
    description?: string;
    confirmWord?: string;
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

/* ===================== Page ===================== */
type FormData = {
    subject_id: string;
    guru_id: string;
    term_id: string;
    kapasitas: string;
    jadwal: ScheduleItem[];
};

export default function Jadwal({ sections, terms, subjects, gurus, activeTerm, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>(filters.search ?? '');
    const [selectedTerm, setSelectedTerm] = useState<string>(filters.term_id ?? activeTerm?.id?.toString() ?? '');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm<FormData>({
        subject_id: '',
        guru_id: '',
        term_id: activeTerm?.id?.toString() ?? '',
        kapasitas: '',
        jadwal: [{ hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }],
    });

    const pagination = useMemo(
        () => ({
            current_page: sections.current_page,
            last_page: sections.last_page,
            from: sections.from,
            to: sections.to,
            total: sections.total,
            links: sections.links,
        }),
        [sections],
    );

    const handleSearch = (): void => {
        router.get(
            route('admin.jadwal.index'),
            { search: searchTerm, term_id: selectedTerm },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleReset = (): void => {
        setSearchTerm('');
        setSelectedTerm(activeTerm?.id?.toString() ?? '');
        router.get(route('admin.jadwal.index'), {}, { replace: true });
    };

    const handleCreate = (): void => {
        post(route('admin.jadwal.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Jadwal berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan jadwal');
            },
            preserveScroll: true,
        });
    };

    const handleEdit = (section: Section): void => {
        setEditingSection(section);
        setData({
            subject_id: section.subject.id.toString(),
            guru_id: section.guru.id.toString(),
            term_id: section.term.id.toString(),
            kapasitas: section.kapasitas?.toString() ?? '',
            jadwal:
                section.jadwal_json && section.jadwal_json.length > 0
                    ? section.jadwal_json
                    : [{ hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }],
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (): void => {
        if (!editingSection) return;
        put(route('admin.jadwal.update', editingSection.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingSection(null);
                reset();
                toast.success('Jadwal berhasil diperbarui');
            },
            onError: () => {
                toast.error('Gagal memperbarui jadwal');
            },
            preserveScroll: true,
        });
    };

    const addScheduleItem = (): void => {
        setData('jadwal', [...data.jadwal, { hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }]);
    };

    const removeScheduleItem = (index: number): void => {
        const next = data.jadwal.filter((_, i) => i !== index);
        setData('jadwal', next.length ? next : [{ hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }]);
    };

    const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string): void => {
        const next = [...data.jadwal];
        next[index] = { ...next[index], [field]: value } as ScheduleItem;
        setData('jadwal', next);
    };

    const getDayLabel = (day: ScheduleItem['hari']): string => {
        const found = DAYS.find((d) => d.value === day);
        return found ? found.label : day;
    };

    const gotoPage = (page: number | string): void => {
        router.get(
            route('admin.jadwal.index'),
            { page, search: searchTerm, term_id: selectedTerm },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AppLayout>
            <Head title="Jadwal" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Daftar Jadwal</CardTitle>

                                {/* Create Dialog */}
                                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Jadwal
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Tambah Jadwal Baru</DialogTitle>
                                        </DialogHeader>

                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="subject_id">Mata Pelajaran</Label>
                                                    <Select value={data.subject_id} onValueChange={(v) => setData('subject_id', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih mata pelajaran" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {subjects.map((subject) => (
                                                                <SelectItem key={subject.id} value={subject.id.toString()}>
                                                                    {subject.kode} - {subject.nama}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.subject_id && <p className="mt-1 text-sm text-red-500">{errors.subject_id}</p>}
                                                </div>

                                                <div>
                                                    <Label htmlFor="guru_id">Guru</Label>
                                                    <Select value={data.guru_id} onValueChange={(v) => setData('guru_id', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih guru" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {gurus.map((guru) => (
                                                                <SelectItem key={guru.id} value={guru.id.toString()}>
                                                                    {guru.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.guru_id && <p className="mt-1 text-sm text-red-500">{errors.guru_id}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <Label htmlFor="term_id">Semester</Label>
                                                    <Select value={data.term_id} onValueChange={(v) => setData('term_id', v)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih semester" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {terms.map((term) => (
                                                                <SelectItem key={term.id} value={term.id.toString()}>
                                                                    {term.nama} {term.tahun}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.term_id && <p className="mt-1 text-sm text-red-500">{errors.term_id}</p>}
                                                </div>

                                                <div>
                                                    <Label htmlFor="kapasitas">Kapasitas</Label>
                                                    <Input
                                                        id="kapasitas"
                                                        type="number"
                                                        value={data.kapasitas}
                                                        onChange={(e) => setData('kapasitas', e.target.value)}
                                                        placeholder="Masukkan kapasitas kelas"
                                                    />
                                                    {errors.kapasitas && <p className="mt-1 text-sm text-red-500">{errors.kapasitas}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Label>Jadwal</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
                                                        <Plus className="mr-1 h-4 w-4" />
                                                        Tambah Jadwal
                                                    </Button>
                                                </div>

                                                {data.jadwal.map((item, index) => (
                                                    <div key={index} className="mb-2 grid grid-cols-1 gap-2 rounded border p-3 md:grid-cols-5">
                                                        <div>
                                                            <Label className="text-xs">Hari</Label>
                                                            <Select value={item.hari} onValueChange={(v) => updateScheduleItem(index, 'hari', v)}>
                                                                <SelectTrigger className="h-8">
                                                                    <SelectValue placeholder="Hari" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {DAYS.map((day) => (
                                                                        <SelectItem key={day.value} value={day.value}>
                                                                            {day.label}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Jam Mulai</Label>
                                                            <Input
                                                                type="time"
                                                                className="h-8"
                                                                value={item.jam_mulai}
                                                                onChange={(e) => updateScheduleItem(index, 'jam_mulai', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Jam Selesai</Label>
                                                            <Input
                                                                type="time"
                                                                className="h-8"
                                                                value={item.jam_selesai}
                                                                onChange={(e) => updateScheduleItem(index, 'jam_selesai', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Ruangan</Label>
                                                            <Input
                                                                className="h-8"
                                                                value={item.ruangan}
                                                                onChange={(e) => updateScheduleItem(index, 'ruangan', e.target.value)}
                                                                placeholder="Ruangan"
                                                            />
                                                        </div>
                                                        <div className="flex items-end">
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={() => removeScheduleItem(index)}
                                                                disabled={data.jadwal.length === 1}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {errors.jadwal && <p className="mt-1 text-sm text-red-500">{errors.jadwal}</p>}
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                                                Batal
                                            </Button>
                                            <Button onClick={handleCreate} disabled={processing}>
                                                {processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Filter */}
                            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            placeholder="Cari mata pelajaran atau guru..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>

                                <div className="w-full md:w-56">
                                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {terms.map((term) => (
                                                <SelectItem key={term.id} value={term.id.toString()}>
                                                    {term.nama} {term.tahun}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button onClick={handleSearch}>Cari</Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>

                            {/* Tabel */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead>Guru</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Kapasitas</TableHead>
                                        <TableHead>Jadwal</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sections.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                                                Tidak ada data jadwal
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sections.data.map((section) => (
                                            <TableRow key={section.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{section.subject.nama}</div>
                                                        <div className="text-sm text-gray-500">{section.subject.kode}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{section.guru.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={section.term.aktif ? 'default' : 'secondary'}>
                                                        {section.term.nama} {section.term.tahun}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{section.kapasitas || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs">
                                                        {section.jadwal_json?.length ? (
                                                            section.jadwal_json.map((j, i) => (
                                                                <div key={i} className="mb-1 text-sm">
                                                                    <Clock className="mr-1 inline h-3 w-3" />
                                                                    {getDayLabel(j.hari)} {j.jam_mulai}-{j.jam_selesai}
                                                                    <br />
                                                                    <span className="ml-4 text-gray-500">{j.ruangan}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-500">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEdit(section)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <ConfirmDeleteDialog
                                                            trigger={
                                                                <Button variant="destructive" size="sm">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            title={`Hapus jadwal "${section.subject.nama}"?`}
                                                            description={`Guru: ${section.guru.name}. Tindakan ini tidak dapat dibatalkan.`}
                                                            confirmWord="HAPUS"
                                                            isLoading={processing}
                                                            onConfirm={() =>
                                                                destroy(route('admin.jadwal.destroy', section.id), {
                                                                    onSuccess: () => toast.success('Jadwal berhasil dihapus'),
                                                                    onError: () => toast.error('Gagal menghapus jadwal'),
                                                                    preserveScroll: true,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="mt-6 flex flex-wrap items-center gap-3 sm:justify-start">
                                {' '}
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan <span className="font-medium">{pagination.from ?? 0}</span>–
                                    <span className="font-medium">{pagination.to ?? 0}</span> dari{' '}
                                    <span className="font-medium">{pagination.total}</span> data
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                    {/* Prev */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page <= 1}
                                        onClick={() => gotoPage(pagination.current_page - 1)}
                                    >
                                        &laquo; Prev
                                    </Button>

                                    {/* Numbers only */}
                                    {pagination.links
                                        .filter((l) => /^\d+$/.test(l.label))
                                        .map((link) => (
                                            <Button
                                                key={link.label}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => gotoPage(link.label)}
                                            >
                                                {link.label}
                                            </Button>
                                        ))}

                                    {/* Next */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.current_page >= pagination.last_page}
                                        onClick={() => gotoPage(pagination.current_page + 1)}
                                    >
                                        Next &raquo;
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Jadwal</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_subject_id">Mata Pelajaran</Label>
                                        <Select value={data.subject_id} onValueChange={(v) => setData('subject_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih mata pelajaran" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                        {subject.kode} - {subject.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && <p className="mt-1 text-sm text-red-500">{errors.subject_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="edit_guru_id">Guru</Label>
                                        <Select value={data.guru_id} onValueChange={(v) => setData('guru_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih guru" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gurus.map((guru) => (
                                                    <SelectItem key={guru.id} value={guru.id.toString()}>
                                                        {guru.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.guru_id && <p className="mt-1 text-sm text-red-500">{errors.guru_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_term_id">Semester</Label>
                                        <Select value={data.term_id} onValueChange={(v) => setData('term_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {terms.map((term) => (
                                                    <SelectItem key={term.id} value={term.id.toString()}>
                                                        {term.nama} {term.tahun}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.term_id && <p className="mt-1 text-sm text-red-500">{errors.term_id}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="edit_kapasitas">Kapasitas</Label>
                                        <Input
                                            id="edit_kapasitas"
                                            type="number"
                                            value={data.kapasitas}
                                            onChange={(e) => setData('kapasitas', e.target.value)}
                                            placeholder="Masukkan kapasitas kelas"
                                        />
                                        {errors.kapasitas && <p className="mt-1 text-sm text-red-500">{errors.kapasitas}</p>}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Label>Jadwal</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
                                            <Plus className="mr-1 h-4 w-4" />
                                            Tambah Jadwal
                                        </Button>
                                    </div>

                                    {data.jadwal.map((item, index) => (
                                        <div key={index} className="mb-2 grid grid-cols-1 gap-2 rounded border p-3 md:grid-cols-5">
                                            <div>
                                                <Label className="text-xs">Hari</Label>
                                                <Select value={item.hari} onValueChange={(v) => updateScheduleItem(index, 'hari', v)}>
                                                    <SelectTrigger className="h-8">
                                                        <SelectValue placeholder="Hari" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DAYS.map((day) => (
                                                            <SelectItem key={day.value} value={day.value}>
                                                                {day.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Jam Mulai</Label>
                                                <Input
                                                    type="time"
                                                    className="h-8"
                                                    value={item.jam_mulai}
                                                    onChange={(e) => updateScheduleItem(index, 'jam_mulai', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Jam Selesai</Label>
                                                <Input
                                                    type="time"
                                                    className="h-8"
                                                    value={item.jam_selesai}
                                                    onChange={(e) => updateScheduleItem(index, 'jam_selesai', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Ruangan</Label>
                                                <Input
                                                    className="h-8"
                                                    value={item.ruangan}
                                                    onChange={(e) => updateScheduleItem(index, 'ruangan', e.target.value)}
                                                    placeholder="Ruangan"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={() => removeScheduleItem(index)}
                                                    disabled={data.jadwal.length === 1}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {errors.jadwal && <p className="mt-1 text-sm text-red-500">{errors.jadwal}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                                    Batal
                                </Button>
                                <Button onClick={handleUpdate} disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Update'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}
