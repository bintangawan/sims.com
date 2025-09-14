import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
}
interface WaliKelas {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    waliKelas?: WaliKelas[]; // guard: bisa belum dikirim dari controller
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
    // Siswa
    nis?: string;
    angkatan?: number;
    kelas?: string;
    wali_kelas_id?: number;
    // Guru
    nidn?: string;
    nuptk?: string;
    mapel_keahlian?: string;
    telepon?: string;
}

// Sentinel untuk Select "wali_kelas"
const WALI_NONE = 'none';

export default function Create({ roles, waliKelas = [] }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        // siswa
        nis: '',
        angkatan: new Date().getFullYear(),
        kelas: '',
        wali_kelas_id: undefined,
        // guru
        nidn: '',
        nuptk: '',
        mapel_keahlian: '',
        telepon: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                toast.success('User berhasil dibuat');
                reset();
            },
            onError: () => toast.error('Gagal membuat user'),
        });
    };

    // Reset field ketika role berubah
    useEffect(() => {
        if (data.role === 'siswa') {
            setData((prev) => ({
                ...prev,
                nidn: '',
                nuptk: '',
                mapel_keahlian: '',
                telepon: '',
            }));
        } else if (data.role === 'guru') {
            setData((prev) => ({
                ...prev,
                nis: '',
                angkatan: undefined,
                kelas: '',
                wali_kelas_id: undefined,
            }));
        } else {
            setData((prev) => ({
                ...prev,
                nis: '',
                angkatan: undefined,
                kelas: '',
                wali_kelas_id: undefined,
                nidn: '',
                nuptk: '',
                mapel_keahlian: '',
                telepon: '',
            }));
        }
    }, [data.role, setData]); // ← tambahkan setData di deps

    const err = (m?: string) => (m ? <p className="text-sm text-red-500">{m}</p> : null);

    return (
        <AppLayout>
            <Head title="Tambah User" />

            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah User</h1>
                        <p className="text-muted-foreground">Buat akun pengguna baru untuk sistem</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Data utama pengguna</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {err(errors.name)}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Masukkan email"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {err(errors.email)}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {err(errors.password)}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Konfirmasi password"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {err(errors.password_confirmation)}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={data.role || undefined} // gunakan undefined agar placeholder tampil
                                        onValueChange={(v) => setData('role', v)}
                                    >
                                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r) => (
                                                <SelectItem key={r.id} value={r.name}>
                                                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {err(errors.role)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SISWA */}
                    {data.role === 'siswa' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Siswa</CardTitle>
                                <CardDescription>Data khusus untuk siswa</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nis">NIS (Opsional)</Label>
                                        <Input
                                            id="nis"
                                            value={data.nis}
                                            onChange={(e) => setData('nis', e.target.value)}
                                            placeholder="Akan dibuat otomatis jika kosong"
                                            className={errors.nis ? 'border-red-500' : ''}
                                        />
                                        {err(errors.nis)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="angkatan">Angkatan</Label>
                                        <Input
                                            id="angkatan"
                                            type="number"
                                            min={2020}
                                            max={2030}
                                            value={data.angkatan ?? ''} // tampilkan kosong jika undefined
                                            onChange={(e) => {
                                                const val = e.target.value.trim();
                                                setData('angkatan', val === '' ? undefined : parseInt(val, 10));
                                            }}
                                            placeholder="Tahun angkatan"
                                            className={errors.angkatan ? 'border-red-500' : ''}
                                        />
                                        {err(errors.angkatan)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kelas">Kelas</Label>
                                        <Input
                                            id="kelas"
                                            value={data.kelas}
                                            onChange={(e) => setData('kelas', e.target.value)}
                                            placeholder="Contoh: XII IPA 1"
                                            className={errors.kelas ? 'border-red-500' : ''}
                                        />
                                        {err(errors.kelas)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Wali Kelas (Opsional)</Label>
                                        <Select
                                            value={data.wali_kelas_id != null ? String(data.wali_kelas_id) : WALI_NONE}
                                            onValueChange={(v) => setData('wali_kelas_id', v === WALI_NONE ? undefined : parseInt(v, 10))}
                                        >
                                            <SelectTrigger className={errors.wali_kelas_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Pilih wali kelas" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={WALI_NONE}>Tidak ada wali kelas</SelectItem>
                                                {waliKelas.map((g) => (
                                                    <SelectItem key={g.id} value={String(g.id)}>
                                                        {g.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {err(errors.wali_kelas_id)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* GURU */}
                    {data.role === 'guru' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Guru</CardTitle>
                                <CardDescription>Data khusus untuk guru</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nidn">NIDN</Label>
                                        <Input
                                            id="nidn"
                                            value={data.nidn}
                                            onChange={(e) => setData('nidn', e.target.value)}
                                            placeholder="Nomor Induk Dosen Nasional"
                                            className={errors.nidn ? 'border-red-500' : ''}
                                        />
                                        {err(errors.nidn)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nuptk">NUPTK</Label>
                                        <Input
                                            id="nuptk"
                                            value={data.nuptk}
                                            onChange={(e) => setData('nuptk', e.target.value)}
                                            placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
                                            className={errors.nuptk ? 'border-red-500' : ''}
                                        />
                                        {err(errors.nuptk)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mapel_keahlian">Mata Pelajaran/Keahlian</Label>
                                        <Input
                                            id="mapel_keahlian"
                                            value={data.mapel_keahlian}
                                            onChange={(e) => setData('mapel_keahlian', e.target.value)}
                                            placeholder="Contoh: Matematika, Fisika"
                                            className={errors.mapel_keahlian ? 'border-red-500' : ''}
                                        />
                                        {err(errors.mapel_keahlian)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telepon">Telepon</Label>
                                        <Input
                                            id="telepon"
                                            value={data.telepon}
                                            onChange={(e) => setData('telepon', e.target.value)}
                                            placeholder="Nomor telepon"
                                            className={errors.telepon ? 'border-red-500' : ''}
                                        />
                                        {err(errors.telepon)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/users">Batal</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
