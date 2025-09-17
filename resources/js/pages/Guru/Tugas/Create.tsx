// resources/js/pages/Guru/Tugas/Create.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
// ⬇️ pakai sub-komponen breadcrumb shadcn
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface Subject {
    id: number;
    kode: string;
    nama: string;
}

interface Section {
    id: number;
    subject: Subject;
}

interface Props {
    section: Section;
}

interface BreadcrumbItemType {
    title: string;
    href: string;
}

interface RubrikItem {
    kriteria: string;
    bobot: number;
    deskripsi: string;
}

interface FormData {
    section_id: number;
    judul: string;
    deskripsi: string;
    tipe: 'file' | 'teks' | 'link' | 'campuran' | '';
    deadline: string;
    rubrik_json: RubrikItem[];
    publish_now: boolean;
}

const breadcrumbs: BreadcrumbItemType[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Kelas', href: '/guru/kelas' },
];

export default function TugasCreate({ section }: Props) {
    const [rubrikItems, setRubrikItems] = useState<RubrikItem[]>([]);

    const { data, setData, post, processing, errors } = useForm<FormData>({
        section_id: section.id,
        judul: '',
        deskripsi: '',
        tipe: '',
        deadline: '',
        rubrik_json: [],
        publish_now: false,
    });

    const addRubrikItem = () => {
        const newItem: RubrikItem = { kriteria: '', bobot: 0, deskripsi: '' };
        const updatedItems = [...rubrikItems, newItem];
        setRubrikItems(updatedItems);
        setData('rubrik_json', updatedItems);
    };

    const removeRubrikItem = (index: number) => {
        const updatedItems = rubrikItems.filter((_, i) => i !== index);
        setRubrikItems(updatedItems);
        setData('rubrik_json', updatedItems);
    };

    const updateRubrikItem = (index: number, field: keyof RubrikItem, value: string | number) => {
        const updatedItems = rubrikItems.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        setRubrikItems(updatedItems);
        setData('rubrik_json', updatedItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate rubrik total weight
        const totalBobot = rubrikItems.reduce((sum, item) => sum + item.bobot, 0);
        if (rubrikItems.length > 0 && totalBobot !== 100) {
            toast.error('Total bobot rubrik harus 100%');
            return;
        }

        post('/guru/tugas', {
            onSuccess: () => toast.success('Tugas berhasil dibuat'),
            onError: () => toast.error('Gagal membuat tugas'),
        });
    };

    // Get minimum datetime (current time + 1 hour)
    const minDateTime = format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm");

    // siapkan crumbs gabungan: statis + dinamis
    const dynamicCrumbs: BreadcrumbItemType[] = [
        { title: section.subject.nama, href: `/guru/kelas/${section.id}` },
        { title: 'Tugas', href: `/guru/tugas?section_id=${section.id}` },
        { title: 'Buat Tugas', href: `/guru/tugas/create?section_id=${section.id}` },
    ];
    const allCrumbs = [...breadcrumbs, ...dynamicCrumbs];

    return (
        <AppLayout>
            <Head title={`Buat Tugas - ${section.subject.nama}`} />

            <div className="space-y-6 p-6">
                {/* Top bar: breadcrumb kiri, area kanan untuk toggle/sidebar control */}
                <div className="flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            {allCrumbs.map((c, idx) => (
                                <React.Fragment key={c.href}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link href={c.href}>{c.title}</Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {idx < allCrumbs.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Slot kanan: taruh toggle sidebar / actions lain kalau ada */}
                    <div />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Buat Tugas Baru</h1>
                        <p className="text-muted-foreground">Buat tugas untuk kelas {section.subject.nama}</p>
                    </div>
                    <Button variant="outline" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Masukkan informasi dasar tugas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="judul">Judul Tugas *</Label>
                                <Input
                                    id="judul"
                                    value={data.judul}
                                    onChange={(e) => setData('judul', e.target.value)}
                                    placeholder="Masukkan judul tugas"
                                    maxLength={200}
                                    required
                                />
                                {errors.judul && <p className="text-sm text-destructive">{errors.judul}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi *</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Masukkan deskripsi tugas"
                                    rows={4}
                                    required
                                />
                                {errors.deskripsi && <p className="text-sm text-destructive">{errors.deskripsi}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tipe">Tipe Pengumpulan *</Label>
                                    <Select
                                        value={data.tipe}
                                        onValueChange={(value: 'file' | 'teks' | 'link' | 'campuran') => setData('tipe', value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe pengumpulan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="file">File</SelectItem>
                                            <SelectItem value="teks">Teks</SelectItem>
                                            <SelectItem value="link">Link</SelectItem>
                                            <SelectItem value="campuran">Campuran</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.tipe && <p className="text-sm text-destructive">{errors.tipe}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Deadline *</Label>
                                    <Input
                                        id="deadline"
                                        type="datetime-local"
                                        value={data.deadline}
                                        onChange={(e) => setData('deadline', e.target.value)}
                                        min={minDateTime}
                                        required
                                    />
                                    {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rubrik Penilaian */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Rubrik Penilaian</CardTitle>
                                    <CardDescription>Opsional: Buat rubrik penilaian untuk tugas ini</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addRubrikItem}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Kriteria
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {rubrikItems.length > 0 ? (
                                <div className="space-y-4">
                                    {rubrikItems.map((item, index) => (
                                        <div key={index} className="rounded-lg border p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="grid flex-1 gap-4 md:grid-cols-3">
                                                    <div className="space-y-2">
                                                        <Label>Kriteria</Label>
                                                        <Input
                                                            value={item.kriteria}
                                                            onChange={(e) => updateRubrikItem(index, 'kriteria', e.target.value)}
                                                            placeholder="Nama kriteria"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Bobot (%)</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.bobot}
                                                            onChange={(e) => updateRubrikItem(index, 'bobot', parseInt(e.target.value) || 0)}
                                                            placeholder="0"
                                                            min={0}
                                                            max={100}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Deskripsi</Label>
                                                        <Input
                                                            value={item.deskripsi}
                                                            onChange={(e) => updateRubrikItem(index, 'deskripsi', e.target.value)}
                                                            placeholder="Deskripsi kriteria"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeRubrikItem(index)}
                                                    className="ml-2 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="rounded-lg bg-muted p-3">
                                        <p className="text-sm">
                                            Total Bobot: {rubrikItems.reduce((sum, item) => sum + item.bobot, 0)}%
                                            {rubrikItems.reduce((sum, item) => sum + item.bobot, 0) !== 100 && (
                                                <span className="ml-2 text-destructive">(Harus 100%)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="py-8 text-center text-muted-foreground">
                                    Belum ada kriteria rubrik. Klik "Tambah Kriteria" untuk menambahkan.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Publikasi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pengaturan Publikasi</CardTitle>
                            <CardDescription>Tentukan kapan tugas akan dipublikasikan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="publish_now"
                                    checked={data.publish_now}
                                    onCheckedChange={(checked) => setData('publish_now', Boolean(checked))}
                                />
                                <Label htmlFor="publish_now">Publikasikan sekarang</Label>
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {data.publish_now
                                    ? 'Tugas akan langsung terlihat oleh siswa setelah dibuat'
                                    : 'Tugas akan disimpan sebagai draft dan dapat dipublikasikan nanti'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Tugas'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
