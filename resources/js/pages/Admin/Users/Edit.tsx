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

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: Array<{ name: string }>;
    siswa_profile?: {
        nis: string;
        angkatan: number;
        kelas: string;
        wali_kelas_id?: number;
    } | null;
    guru_profile?: {
        nidn: string;
        nuptk: string;
        mapel_keahlian: string;
        telepon: string;
    } | null;
}

interface Props {
    user: User;
    roles: Role[];
}

interface FormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: string;
    // Siswa fields
    nis?: string;
    angkatan?: number;
    kelas?: string;
    wali_kelas_id?: number;
    // Guru fields
    nidn?: string;
    nuptk?: string;
    mapel_keahlian?: string;
    telepon?: string;
}

export default function Edit({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.roles[0]?.name || '',
        nis: user.siswa_profile?.nis || '',
        angkatan: user.siswa_profile?.angkatan,
        kelas: user.siswa_profile?.kelas || '',
        wali_kelas_id: user.siswa_profile?.wali_kelas_id,
        nidn: user.guru_profile?.nidn || '',
        nuptk: user.guru_profile?.nuptk || '',
        mapel_keahlian: user.guru_profile?.mapel_keahlian || '',
        telepon: user.guru_profile?.telepon || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        put(route('admin.users.update', user.id), {
            onSuccess: () => {
                toast.success('User berhasil diupdate');
            },
            onError: () => {
                toast.error('Gagal mengupdate user');
            },
        });
    };

    // Reset form fields when role changes
    useEffect(() => {
        if (data.role === 'siswa') {
            setData(prev => ({
                ...prev,
                nidn: '',
                nuptk: '',
                mapel_keahlian: '',
                telepon: '',
            }));
        } else if (data.role === 'guru') {
            setData(prev => ({
                ...prev,
                nis: '',
                angkatan: undefined,
                kelas: '',
                wali_kelas_id: undefined,
            }));
        } else {
            setData(prev => ({
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
    }, [data.role]);

    return (
        <AppLayout>
            <Head title={`Edit User - ${user.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                        <p className="text-muted-foreground">Ubah informasi pengguna - {user.name}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Dasar</CardTitle>
                            <CardDescription>Data utama pengguna</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru (Opsional)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Konfirmasi password baru"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.name}>
                                                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Siswa Profile Fields */}
                    {data.role === 'siswa' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Siswa</CardTitle>
                                <CardDescription>Data khusus untuk siswa</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nis">NIS</Label>
                                        <Input
                                            id="nis"
                                            type="text"
                                            value={data.nis}
                                            onChange={(e) => setData('nis', e.target.value)}
                                            placeholder="Nomor Induk Siswa"
                                            className={errors.nis ? 'border-red-500' : ''}
                                        />
                                        {errors.nis && <p className="text-sm text-red-500">{errors.nis}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="angkatan">Angkatan</Label>
                                        <Input
                                            id="angkatan"
                                            type="number"
                                            min="2020"
                                            max="2030"
                                            value={data.angkatan || ''}
                                            onChange={(e) => setData('angkatan', parseInt(e.target.value) || undefined)}
                                            placeholder="Tahun angkatan"
                                            className={errors.angkatan ? 'border-red-500' : ''}
                                        />
                                        {errors.angkatan && <p className="text-sm text-red-500">{errors.angkatan}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kelas">Kelas</Label>
                                        <Input
                                            id="kelas"
                                            type="text"
                                            value={data.kelas}
                                            onChange={(e) => setData('kelas', e.target.value)}
                                            placeholder="Contoh: XII IPA 1"
                                            className={errors.kelas ? 'border-red-500' : ''}
                                        />
                                        {errors.kelas && <p className="text-sm text-red-500">{errors.kelas}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Guru Profile Fields */}
                    {data.role === 'guru' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Guru</CardTitle>
                                <CardDescription>Data khusus untuk guru</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nidn">NIDN</Label>
                                        <Input
                                            id="nidn"
                                            type="text"
                                            value={data.nidn}
                                            onChange={(e) => setData('nidn', e.target.value)}
                                            placeholder="Nomor Induk Dosen Nasional"
                                            className={errors.nidn ? 'border-red-500' : ''}
                                        />
                                        {errors.nidn && <p className="text-sm text-red-500">{errors.nidn}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nuptk">NUPTK</Label>
                                        <Input
                                            id="nuptk"
                                            type="text"
                                            value={data.nuptk}
                                            onChange={(e) => setData('nuptk', e.target.value)}
                                            placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
                                            className={errors.nuptk ? 'border-red-500' : ''}
                                        />
                                        {errors.nuptk && <p className="text-sm text-red-500">{errors.nuptk}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mapel_keahlian">Mata Pelajaran/Keahlian</Label>
                                        <Input
                                            id="mapel_keahlian"
                                            type="text"
                                            value={data.mapel_keahlian}
                                            onChange={(e) => setData('mapel_keahlian', e.target.value)}
                                            placeholder="Contoh: Matematika, Fisika"
                                            className={errors.mapel_keahlian ? 'border-red-500' : ''}
                                        />
                                        {errors.mapel_keahlian && (
                                            <p className="text-sm text-red-500">{errors.mapel_keahlian}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telepon">Telepon</Label>
                                        <Input
                                            id="telepon"
                                            type="text"
                                            value={data.telepon}
                                            onChange={(e) => setData('telepon', e.target.value)}
                                            placeholder="Nomor telepon"
                                            className={errors.telepon ? 'border-red-500' : ''}
                                        />
                                        {errors.telepon && <p className="text-sm text-red-500">{errors.telepon}</p>}
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
                            {processing ? 'Menyimpan...' : 'Update User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}