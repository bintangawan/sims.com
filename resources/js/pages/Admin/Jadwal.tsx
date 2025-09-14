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
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

interface Section {
    id: number;
    subject: {
        id: number;
        nama: string;
        kode: string;
    };
    guru: {
        id: number;
        name: string;
    };
    term: {
        id: number;
        nama: string;
        tahun: string;
        aktif: boolean;
    };
    kapasitas: number;
    jadwal_json: ScheduleItem[];
    created_at: string;
}

interface ScheduleItem {
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface Props extends SharedData {
    sections: {
        data: Section[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    terms: Term[];
    subjects: Subject[];
    gurus: Guru[];
    activeTerm: Term;
    filters: {
        search?: string;
        term_id?: string;
    };
}

const DAYS = [
    { value: 'senin', label: 'Senin' },
    { value: 'selasa', label: 'Selasa' },
    { value: 'rabu', label: 'Rabu' },
    { value: 'kamis', label: 'Kamis' },
    { value: 'jumat', label: 'Jumat' },
    { value: 'sabtu', label: 'Sabtu' },
];

// ────────────────────────────────────────────────────────────────────────────────
// Confirm Delete Dialog (copy gaya dari Index.tsx)
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

// ────────────────────────────────────────────────────────────────────────────────
// Page
export default function Jadwal({ sections, terms, subjects, gurus, activeTerm, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedTerm, setSelectedTerm] = useState(filters.term_id || activeTerm?.id?.toString() || '');

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        subject_id: '',
        guru_id: '',
        term_id: activeTerm?.id || '',
        kapasitas: '',
        jadwal: [{ hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }] as ScheduleItem[],
    });

    const handleSearch = () => {
        router.get(
            route('admin.jadwal.index'),
            {
                search: searchTerm,
                term_id: selectedTerm,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedTerm(activeTerm?.id?.toString() || '');
        router.get(route('admin.jadwal.index'));
    };

    const handleCreate = () => {
        post(route('admin.jadwal.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
                toast.success('Jadwal berhasil ditambahkan');
            },
            onError: () => {
                toast.error('Gagal menambahkan jadwal');
            },
        });
    };

    const handleEdit = (section: Section) => {
        setEditingSection(section);
        setData({
            subject_id: section.subject.id.toString(),
            guru_id: section.guru.id.toString(),
            term_id: section.term.id.toString(),
            kapasitas: section.kapasitas?.toString() || '',
            jadwal: section.jadwal_json || [{ hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }],
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
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
        });
    };

    // ❌ HAPUS versi confirm() bawaan browser
    // const handleDelete = (section: Section) => { ... }

    const addScheduleItem = () => {
        setData('jadwal', [...data.jadwal, { hari: '', jam_mulai: '', jam_selesai: '', ruangan: '' }]);
    };

    const removeScheduleItem = (index: number) => {
        const newJadwal = data.jadwal.filter((_, i) => i !== index);
        setData('jadwal', newJadwal);
    };

    const updateScheduleItem = (index: number, field: keyof ScheduleItem, value: string) => {
        const newJadwal = [...data.jadwal];
        newJadwal[index] = { ...newJadwal[index], [field]: value };
        setData('jadwal', newJadwal);
    };

    const getDayLabel = (day: string) => {
        const dayObj = DAYS.find((d) => d.value === day);
        return dayObj ? dayObj.label : day;
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
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="subject_id">Mata Pelajaran</Label>
                                                    <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
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
                                                    <Select value={data.guru_id} onValueChange={(value) => setData('guru_id', value)}>
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
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="term_id">Semester</Label>
                                                    <Select value={data.term_id.toString()} onValueChange={(value) => setData('term_id', value)}>
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
                                                    <div key={index} className="mb-2 grid grid-cols-5 gap-2 rounded border p-3">
                                                        <div>
                                                            <Label className="text-xs">Hari</Label>
                                                            <Select
                                                                value={item.hari}
                                                                onValueChange={(value) => updateScheduleItem(index, 'hari', value)}
                                                            >
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
                            {/* Filter Section */}
                            <div className="mb-6 flex gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                        <Input
                                            placeholder="Cari mata pelajaran atau guru..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>
                                <div className="w-48">
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

                            {/* Table */}
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
                                                        {section.jadwal_json && section.jadwal_json.length > 0 ? (
                                                            section.jadwal_json.map((jadwal, index) => (
                                                                <div key={index} className="mb-1 text-sm">
                                                                    <Clock className="mr-1 inline h-3 w-3" />
                                                                    {getDayLabel(jadwal.hari)} {jadwal.jam_mulai}-{jadwal.jam_selesai}
                                                                    <br />
                                                                    <span className="ml-4 text-gray-500">{jadwal.ruangan}</span>
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

                                                        {/* ✅ Pakai ConfirmDeleteDialog */}
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
                        </CardContent>
                    </Card>

                    {/* Edit Dialog */}
                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Jadwal</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit_subject_id">Mata Pelajaran</Label>
                                        <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
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
                                        <Select value={data.guru_id} onValueChange={(value) => setData('guru_id', value)}>
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="edit_term_id">Semester</Label>
                                        <Select value={data.term_id.toString()} onValueChange={(value) => setData('term_id', value)}>
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
                                        <div key={index} className="mb-2 grid grid-cols-5 gap-2 rounded border p-3">
                                            <div>
                                                <Label className="text-xs">Hari</Label>
                                                <Select value={item.hari} onValueChange={(value) => updateScheduleItem(index, 'hari', value)}>
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
