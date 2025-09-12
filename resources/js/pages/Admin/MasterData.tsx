import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { type PaginatedData } from '@/types';

interface Term {
    id: number;
    tahun: string;
    semester: 'ganjil' | 'genap';
    aktif: boolean;
    created_at: string;
}

interface Subject {
    id: number;
    kode: string;
    nama: string;
    deskripsi?: string;
    created_at: string;
}

interface Section {
    id: number;
    nama: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    subject: Subject;
    guru: { name: string };
    term: Term;
    created_at: string;
}

interface Props {
    terms: Term[];
    subjects: Subject[];
    sections: PaginatedData<Section>;
}

export default function MasterData({ terms, subjects, sections }: Props) {
    const [activeTab, setActiveTab] = useState('terms');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});

    const dayNames = {
        1: 'Senin',
        2: 'Selasa',
        3: 'Rabu',
        4: 'Kamis',
        5: 'Jumat',
        6: 'Sabtu',
        7: 'Minggu',
    };

    const handleSubmit = (type: string) => {
        const endpoint = editingItem ? `/admin/master-data/${type}/${editingItem.id}` : `/admin/master-data/${type}`;

        const method = editingItem ? 'put' : 'post';

        router[method](endpoint, formData, {
            onSuccess: () => {
                toast.success(`${type} berhasil ${editingItem ? 'diperbarui' : 'ditambahkan'}`);
                setIsDialogOpen(false);
                setEditingItem(null);
                setFormData({});
            },
            onError: (errors) => {
                toast.error('Terjadi kesalahan');
            },
        });
    };

    const handleDelete = (type: string, id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            router.delete(`/admin/master-data/${type}/${id}`, {
                onSuccess: () => {
                    toast.success(`${type} berhasil dihapus`);
                },
                onError: () => {
                    toast.error('Gagal menghapus item');
                },
            });
        }
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

    const openDialog = (type: string, item?: any) => {
        setEditingItem(item || null);
        setFormData(item || {});
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
                                    <Button onClick={() => openDialog('terms')}>
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
                                                        <Button size="sm" variant="outline" onClick={() => openDialog('terms', term)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleDelete('terms', term.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                                        <CardDescription>Kelola daftar mata pelajaran</CardDescription>
                                    </div>
                                    <Button onClick={() => openDialog('subjects')}>
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
                                                <TableCell className="font-mono">{subject.kode}</TableCell>
                                                <TableCell className="font-medium">{subject.nama}</TableCell>
                                                <TableCell>{subject.deskripsi || '-'}</TableCell>
                                                <TableCell>{new Date(subject.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openDialog('subjects', subject)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleDelete('subjects', subject.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                                    <Button onClick={() => openDialog('sections')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Tambah Kelas
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Kelas</TableHead>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            <TableHead>Guru</TableHead>
                                            <TableHead>Jadwal</TableHead>
                                            <TableHead>Term</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sections.data.map((section) => (
                                            <TableRow key={section.id}>
                                                <TableCell className="font-medium">{section.nama}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{section.subject.nama}</div>
                                                        <div className="text-sm text-muted-foreground">{section.subject.kode}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{section.guru.name}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        <div>{dayNames[section.day_of_week]}</div>
                                                        <div className="text-muted-foreground">
                                                            {section.start_time} - {section.end_time}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {section.term.tahun} - {section.term.semester}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => openDialog('sections', section)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleDelete('sections', section.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Edit' : 'Tambah'}{' '}
                                {activeTab === 'terms' ? 'Term' : activeTab === 'subjects' ? 'Mata Pelajaran' : 'Kelas'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {activeTab === 'terms' && (
                                <>
                                    <div>
                                        <Label htmlFor="tahun">Tahun Ajaran</Label>
                                        <Input
                                            id="tahun"
                                            placeholder="2024/2025"
                                            value={formData.tahun || ''}
                                            onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select
                                            value={formData.semester || ''}
                                            onValueChange={(value) => setFormData({ ...formData, semester: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ganjil">Ganjil</SelectItem>
                                                <SelectItem value="genap">Genap</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {activeTab === 'subjects' && (
                                <>
                                    <div>
                                        <Label htmlFor="kode">Kode Mata Pelajaran</Label>
                                        <Input
                                            id="kode"
                                            placeholder="MTK001"
                                            value={formData.kode || ''}
                                            onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="nama">Nama Mata Pelajaran</Label>
                                        <Input
                                            id="nama"
                                            placeholder="Matematika"
                                            value={formData.nama || ''}
                                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="deskripsi">Deskripsi</Label>
                                        <Textarea
                                            id="deskripsi"
                                            placeholder="Deskripsi mata pelajaran..."
                                            value={formData.deskripsi || ''}
                                            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={() => handleSubmit(activeTab)}>{editingItem ? 'Perbarui' : 'Simpan'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
