import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Term {
    id: number;
}

interface Guru {
    id: number;
    name: string;
}

interface Section {
    id: number;
    subject: Subject;
    term: Term;
    guru: Guru;
    capacity?: number;
}

interface Props {
    sections: Section[];
    userRole: 'siswa' | 'guru' | 'admin';
}

type ScopeType = 'global' | 'section' | 'role' | '';

interface FormData {
    title: string;
    content: string;
    scope_type: ScopeType;
    scope_id: string | null;
    role_name: 'siswa' | 'guru' | 'admin' | null;
    published_at: string;
}

export default function Create({ sections, userRole }: Props) {
    const { data, setData, post, processing, errors, reset, transform } = useForm<FormData>({
        title: '',
        content: '',
        scope_type: '',
        scope_id: null,
        role_name: null,
        published_at: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Mutasi payload tepat sebelum request dikirim
        transform((current) => ({
            ...current,
            scope_id: current.scope_type === 'section' ? current.scope_id : null,
            role_name: current.scope_type === 'role' ? current.role_name : null,
        }));

        // Kirim data form (yang sudah di-transform)
        post(route('admin.announcements.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleScopeTypeChange = (value: string) => {
        setData({
            ...data,
            scope_type: value as ScopeType,
            scope_id: null,
            role_name: null,
        });
    };

    return (
        <AppLayout>
            <Head title="Buat Pengumuman" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Buat Pengumuman</h1>
                        <p className="text-gray-600">Buat pengumuman baru untuk siswa, guru, atau admin</p>
                    </div>
                    <Link href={route('admin.announcements.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Pengumuman</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Pengumuman</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul pengumuman"
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">Isi Pengumuman</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Masukkan isi pengumuman"
                                    rows={6}
                                    className={errors.content ? 'border-red-500' : ''}
                                />
                                {errors.content && <p className="text-sm text-red-600">{errors.content}</p>}
                            </div>

                            {/* Scope Type */}
                            <div className="space-y-2">
                                <Label htmlFor="scope_type">Tipe Target</Label>
                                <Select value={data.scope_type} onValueChange={handleScopeTypeChange}>
                                    <SelectTrigger className={errors.scope_type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Pilih target pengumuman" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* Guru tidak boleh membuat global → sembunyikan opsi global */}
                                        {userRole !== 'guru' && <SelectItem value="global">Global (Semua Pengguna)</SelectItem>}
                                        <SelectItem value="role">Berdasarkan Role</SelectItem>
                                        <SelectItem value="section">Berdasarkan Kelas</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.scope_type && <p className="text-sm text-red-600">{errors.scope_type}</p>}
                            </div>

                            {/* Role Selection */}
                            {data.scope_type === 'role' && (
                                <div className="space-y-2">
                                    <Label htmlFor="role_name">Pilih Role</Label>
                                    <Select
                                        value={data.role_name ?? ''}
                                        onValueChange={(value) => setData('role_name', value as FormData['role_name'])}
                                    >
                                        <SelectTrigger className={errors.role_name ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih role target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="siswa">Siswa</SelectItem>
                                            <SelectItem value="guru">Guru</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role_name && <p className="text-sm text-red-600">{errors.role_name}</p>}
                                </div>
                            )}

                            {/* Section Selection */}
                            {data.scope_type === 'section' && (
                                <div className="space-y-2">
                                    <Label htmlFor="scope_id">Pilih Kelas</Label>
                                    <Select value={data.scope_id ?? ''} onValueChange={(value) => setData('scope_id', value)}>
                                        <SelectTrigger className={errors.scope_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih kelas target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((section) => (
                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                    {section.subject.kode} - {section.subject.nama} ({section.guru.name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.scope_id && <p className="text-sm text-red-600">{errors.scope_id}</p>}
                                </div>
                            )}

                            {/* Published At */}
                            <div className="space-y-2">
                                <Label htmlFor="published_at">Tanggal Publikasi (Opsional)</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                    className={errors.published_at ? 'border-red-500' : ''}
                                />
                                <p className="text-sm text-gray-500">Kosongkan untuk publikasi langsung</p>
                                {errors.published_at && <p className="text-sm text-red-600">{errors.published_at}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <Link href={route('admin.announcements.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Pengumuman'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
