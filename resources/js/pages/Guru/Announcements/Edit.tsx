import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Subject {
    id: number;
    nama: string;
    kode: string;
}

interface Term {
    id: number;
    nama: string;
    tahun_ajaran: string;
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
    capacity: number;
}

interface Creator {
    id: number;
    name: string;
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
    sections: Section[];
    userRole: 'siswa' | 'guru' | 'admin';
}

interface FormData {
    title: string;
    content: string;
    scope_type: 'section' | 'role' | '';
    scope_id: string;
    role_name: 'siswa' | 'guru' | 'admin' | '';
    published_at: string;
}

export default function Edit({ announcement, sections, userRole }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        title: announcement.title,
        content: announcement.content,
        scope_type: announcement.scope_type === 'global' ? 'role' : announcement.scope_type, // Guru tidak bisa edit global
        scope_id: announcement.scope_id ? String(announcement.scope_id) : '',
        role_name: (announcement.role_name ?? '') as FormData['role_name'],
        published_at: announcement.published_at ? format(new Date(announcement.published_at), "yyyy-MM-dd'T'HH:mm") : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('guru.announcements.update', announcement.id));
    };

    const handleScopeTypeChange = (value: string) => {
        setData({
            ...data,
            scope_type: value as FormData['scope_type'],
            scope_id: '',
            role_name: '',
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit Pengumuman: ${announcement.title}`} />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Pengumuman</h1>
                        <p className="text-gray-600">Perbarui informasi pengumuman</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Peran Anda: <span className="font-medium">{userRole}</span>
                        </p>
                    </div>
                    <Link href={route('guru.announcements.index')}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Edit Pengumuman</CardTitle>
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
                                    <Select value={data.role_name} onValueChange={(value) => setData('role_name', value as FormData['role_name'])}>
                                        <SelectTrigger className={errors.role_name ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih role target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="siswa">Siswa</SelectItem>
                                            <SelectItem value="guru">Guru</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role_name && <p className="text-sm text-red-600">{errors.role_name}</p>}
                                </div>
                            )}

                            {/* Section Selection */}
                            {data.scope_type === 'section' && (
                                <div className="space-y-2">
                                    <Label htmlFor="scope_id">Pilih Kelas</Label>
                                    <Select value={data.scope_id} onValueChange={(value) => setData('scope_id', value)}>
                                        <SelectTrigger className={errors.scope_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih kelas target" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((section) => (
                                                <SelectItem key={section.id} value={section.id.toString()}>
                                                    {section.subject.kode} - {section.subject.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.scope_id && <p className="text-sm text-red-600">{errors.scope_id}</p>}
                                </div>
                            )}

                            {/* Published At */}
                            <div className="space-y-2">
                                <Label htmlFor="published_at">Tanggal Publikasi</Label>
                                <Input
                                    id="published_at"
                                    type="datetime-local"
                                    value={data.published_at}
                                    onChange={(e) => setData('published_at', e.target.value)}
                                    className={errors.published_at ? 'border-red-500' : ''}
                                />
                                {errors.published_at && <p className="text-sm text-red-600">{errors.published_at}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <Link href={route('guru.announcements.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Perbarui Pengumuman'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}