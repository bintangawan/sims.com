import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { toast } from 'sonner';

// Shadcn AlertDialog family (dipakai di ConfirmDeleteDialog)
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

// ────────────────────────────────────────────────────────────────────────────────
// Interface sesuai dengan struktur database dan controller
interface Term {
    id: number;
    tahun: string;
    semester: 'ganjil' | 'genap';
    aktif: boolean;
    created_at: string;
    updated_at?: string;
    [key: string]: string | number | boolean | undefined;
}

interface Subject {
    id: number;
    kode: string;
    nama: string;
    deskripsi?: string;
    created_at: string;
    updated_at?: string;
    [key: string]: string | number | boolean | undefined;
}

interface Section {
    id: number;
    subject_id: number;
    guru_id: number;
    term_id: number;
    kapasitas?: number;
    jadwal_json?: Record<string, unknown>[];
    created_at: string;
    updated_at?: string;
    subject: Subject;
    guru: { id: number; name: string; email?: string };
    term: Term;
    [key: string]: string | number | boolean | undefined | Record<string, unknown>[] | Subject | Term | { id: number; name: string; email?: string };
}

interface Props {
    terms: Term[];
    subjects: Subject[];
    sections: PaginatedData<Section>;
}

type FormDataType = Record<string, string | number | boolean>;

// ────────────────────────────────────────────────────────────────────────────────
// Komponen reusable untuk dialog konfirmasi hapus
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

// ────────────────────────────────────────────────────────────────────────────────

export default function MasterData({ terms, subjects, sections }: Props) {
    const [activeTab, setActiveTab] = useState('terms');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Term | Subject | Section | null>(null);
    const [formData, setFormData] = useState<FormDataType>({});
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = () => {
        const endpoint = editingItem ? `/admin/master-data/${activeTab}/${editingItem.id}` : `/admin/master-data/${activeTab}`;
        const method = editingItem ? 'put' : 'post';

        router[method](endpoint, formData, {
            onSuccess: () => {
                toast.success(`${activeTab} berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}`);
                setIsDialogOpen(false);
                setEditingItem(null);
                setFormData({});
            },
            onError: () => {
                toast.error('Terjadi kesalahan');
            },
        });
    };

    const handleDelete = (type: 'terms' | 'subjects' | 'sections', id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/master-data/${type}/${id}`, {
            onSuccess: () => {
                toast.success(`${type} berhasil dihapus`);
            },
            onError: () => {
                toast.error('Gagal menghapus item');
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const handleActivateTerm = (termId: number) => {
        router.patch(
            `/admin/master-data/terms/${termId}/activate`,
            {},
            {
                onSuccess: () => {
                    toast.success('Term berhasil diaktifkan');
                },
                onError: () => {
                    toast.error('Gagal mengaktifkan term');
                },
            },
        );
    };

    const openDialog = (item?: Term | Subject | Section) => {
        setEditingItem(item || null);
        if (item) {
            // Convert item to form data format
            const formDataObj: FormDataType = {};
            Object.keys(item).forEach((key) => {
                const value = (item as Record<string, unknown>)[key];
                if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                    formDataObj[key] = value;
                }
            });
            setFormData(formDataObj);
        } else {
            setFormData({});
        }
        setIsDialogOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Master Data" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Master Data</h1>
                    <p className="text-muted-foreground">Kelola data master sistem (Term, Mata Pelajaran, Kelas)</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="terms">Term Akademik</TabsTrigger>
                        <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
                        <TabsTrigger value="sections">Kelas/Section</TabsTrigger>
                    </TabsList>

                    {/* Terms Tab */}
                    <TabsContent value="terms">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Term Akademik</CardTitle>
                                        <CardDescription>Kelola tahun ajaran dan semester</CardDescription>
                                    </div>
                                    <Button onClick={() => openDialog()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Term
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tahun Ajaran</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Dibuat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {terms.map((term) => (
                                            <TableRow key={term.id}>
                                                <TableCell className="font-medium">{term.tahun}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{term.semester.charAt(0).toUpperCase() + term.semester.slice(1)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={term.aktif ? 'default' : 'secondary'}>
                                                        {term.aktif ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(term.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {!term.aktif && (
                                                            <Button size="sm" variant="outline" onClick={() => handleActivateTerm(term.id)}>
                                                                <CheckCircle className="mr-1 h-4 w-4" />
                                                                Aktifkan
                                                            </Button>
                                                        )}
                                                        <Button size="sm" variant="outline" onClick={() => openDialog(term)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <ConfirmDeleteDialog
                                                            trigger={
                                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            title={`Hapus Term "${term.tahun} - ${term.semester}"?`}
                                                            description="Menghapus term dapat memengaruhi penjadwalan terkait. Pastikan ini yang Anda inginkan."
                                                            onConfirm={() => handleDelete('terms', term.id)}
                                                            isLoading={isDeleting}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Subjects Tab */}
                    <TabsContent value="subjects">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Mata Pelajaran</CardTitle>
                                        <CardDescription>Kelola mata pelajaran yang tersedia</CardDescription>
                                    </div>
                                    <Button onClick={() => openDialog()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Mata Pelajaran
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead>Dibuat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjects.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.kode}</TableCell>
                                                <TableCell>{subject.nama}</TableCell>
                                                <TableCell>{subject.deskripsi || '-'}</TableCell>
                                                <TableCell>{new Date(subject.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openDialog(subject)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <ConfirmDeleteDialog
                                                            trigger={
                                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            title={`Hapus Mata Pelajaran "${subject.nama}"?`}
                                                            description={`Kode: ${subject.kode}. Data terkait mungkin ikut terhapus.`}
                                                            onConfirm={() => handleDelete('subjects', subject.id)}
                                                            isLoading={isDeleting}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sections Tab */}
                    <TabsContent value="sections">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Kelas/Section</CardTitle>
                                        <CardDescription>Kelola kelas dan jadwal pembelajaran</CardDescription>
                                    </div>
                                    <Button onClick={() => openDialog()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kelas
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            <TableHead>Guru</TableHead>
                                            <TableHead>Term</TableHead>
                                            <TableHead>Kapasitas</TableHead>
                                            <TableHead>Dibuat</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sections.data.map((section) => (
                                            <TableRow key={section.id}>
                                                <TableCell className="font-medium">{section.subject.nama}</TableCell>
                                                <TableCell>{section.guru.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {section.term.tahun} {section.term.semester}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{section.kapasitas || '-'}</TableCell>
                                                <TableCell>{new Date(section.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openDialog(section)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <ConfirmDeleteDialog
                                                            trigger={
                                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                            title={`Hapus Kelas "${section.subject.nama}"?`}
                                                            description={`Guru: ${section.guru.name} • Term: ${section.term.tahun} ${section.term.semester}. Menghapus kelas tidak dapat dibatalkan.`}
                                                            onConfirm={() => handleDelete('sections', section.id)}
                                                            isLoading={isDeleting}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Dialog for Add/Edit */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Edit' : 'Tambah'}{' '}
                                {activeTab === 'terms' ? 'Term' : activeTab === 'subjects' ? 'Mata Pelajaran' : 'Kelas'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {activeTab === 'terms' && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="tahun" className="text-right">
                                            Tahun Ajaran
                                        </Label>
                                        <Input
                                            id="tahun"
                                            value={(formData.tahun as string) || ''}
                                            onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                                            className="col-span-3"
                                            placeholder="2023/2024"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="semester" className="text-right">
                                            Semester
                                        </Label>
                                        <Select
                                            value={(formData.semester as string) || ''}
                                            onValueChange={(value: 'ganjil' | 'genap') => setFormData({ ...formData, semester: value })}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Pilih semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ganjil">Ganjil</SelectItem>
                                                <SelectItem value="genap">Genap</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="aktif" className="text-right">
                                            Status Aktif
                                        </Label>
                                        <Select
                                            value={formData.aktif ? 'true' : 'false'}
                                            onValueChange={(value) => setFormData({ ...formData, aktif: value === 'true' })}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Aktif</SelectItem>
                                                <SelectItem value="false">Tidak Aktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {activeTab === 'subjects' && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="kode" className="text-right">
                                            Kode
                                        </Label>
                                        <Input
                                            id="kode"
                                            value={(formData.kode as string) || ''}
                                            onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                                            className="col-span-3"
                                            placeholder="MTK001"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="nama" className="text-right">
                                            Nama
                                        </Label>
                                        <Input
                                            id="nama"
                                            value={(formData.nama as string) || ''}
                                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                            className="col-span-3"
                                            placeholder="Matematika"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="deskripsi" className="text-right">
                                            Deskripsi
                                        </Label>
                                        <Textarea
                                            id="deskripsi"
                                            value={(formData.deskripsi as string) || ''}
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                            className="col-span-3"
                                            placeholder="Deskripsi mata pelajaran..."
                                        />
                                    </div>
                                </>
                            )}

                            {activeTab === 'sections' && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="subject_id" className="text-right">
                                            Mata Pelajaran
                                        </Label>
                                        <Select
                                            value={formData.subject_id?.toString() || ''}
                                            onValueChange={(value) => setFormData({ ...formData, subject_id: parseInt(value) })}
                                        >
                                            <SelectTrigger className="col-span-3">
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
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="term_id" className="text-right">
                                            Term
                                        </Label>
                                        <Select
                                            value={formData.term_id?.toString() || ''}
                                            onValueChange={(value) => setFormData({ ...formData, term_id: parseInt(value) })}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Pilih term" />
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
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="kapasitas" className="text-right">
                                            Kapasitas
                                        </Label>
                                        <Input
                                            id="kapasitas"
                                            type="number"
                                            value={(formData.kapasitas as number) || ''}
                                            onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 0 })}
                                            className="col-span-3"
                                            placeholder="30"
                                            min="1"
                                            max="50"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="button" onClick={handleSubmit}>
                                {editingItem ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
