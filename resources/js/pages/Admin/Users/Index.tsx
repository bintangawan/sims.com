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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Download,
    Edit,
    FileSpreadsheet,
    Filter,
    X as IconX,
    Info,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    Upload,
    UploadCloud,
    UserCheck,
    UserX,
} from 'lucide-react';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────────────────────────────
// Sentinel constants
const ROLE_ALL = 'all';
const STATUS_ALL = 'all';
const STATUS_ACTIVE = '1';
const STATUS_INACTIVE = '0';

// ────────────────────────────────────────────────────────────────────────────────
// Dialog konfirmasi hapus
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
// Dialog Import (cantik)
type ImportUsersDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDone?: () => void;
};

function humanSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ImportUsersDialog({ open, onOpenChange, onDone }: ImportUsersDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const maxSizeBytes = 2 * 1024 * 1024;
    const allowed = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

    const validateFile = (f: File) => {
        if (!allowed.includes(f.type) && !/\.(csv|xlsx|xls)$/i.test(f.name)) {
            toast.error('Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls');
            return false;
        }
        if (f.size > maxSizeBytes) {
            toast.error('Ukuran file maksimal 2MB');
            return false;
        }
        return true;
    };

    const pickFile = () => inputRef.current?.click();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!validateFile(f)) {
            e.target.value = '';
            return;
        }
        setFile(f);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f && validateFile(f)) {
            setFile(f);
        }
    };
    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging) setDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const clearFile = () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const upload = () => {
        if (!file) {
            toast.error('Silakan pilih file terlebih dahulu');
            return;
        }
        setUploading(true);

        const fd = new FormData();
        fd.append('file', file);

        router.post('/admin/users/import', fd, {
            onSuccess: () => {
                toast.success('Import berhasil diproses');
                clearFile();
                onOpenChange(false);
                onDone?.();
            },
            onError: () => {
                toast.error('Gagal import file');
            },
            onFinish: () => {
                setUploading(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !uploading && onOpenChange(v)}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UploadCloud className="h-5 w-5" />
                        Import Pengguna
                    </DialogTitle>
                    <DialogDescription>
                        Unggah file <b>CSV/XLSX/XLS</b> berisi data pengguna. Maksimal <b>2MB</b>. Sistem akan membuat akun sesuai kolom yang diisi.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <FileSpreadsheet className="h-4 w-4" />
                                Kolom minimum
                            </CardTitle>
                            <CardDescription className="text-xs">name, email, role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs">
                            <div>• role: admin | guru | siswa</div>
                            <div>• password opsional (default: password)</div>
                        </CardContent>
                    </Card>

                    <Card className="border-dashed">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Info className="h-4 w-4" />
                                Kolom opsional
                            </CardTitle>
                            <CardDescription className="text-xs">Bergantung role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs">
                            <div>• siswa: nis, angkatan, kelas, wali_kelas_id</div>
                            <div>• guru: nidn, nuptk, mapel_keahlian, telepon</div>
                        </CardContent>
                    </Card>
                </div>

                <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    className={`mt-3 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition ${
                        dragging ? 'border-primary/60 bg-primary/5' : 'border-muted-foreground/20'
                    }`}
                >
                    <Upload className="h-6 w-6 opacity-70" />
                    <div className="text-sm">
                        Seret & letakkan file di sini, atau{' '}
                        <button type="button" onClick={pickFile} className="font-semibold underline underline-offset-4">
                            pilih file
                        </button>
                    </div>
                    <div className="text-xs text-muted-foreground">Format: .csv, .xlsx, .xls — Maks 2MB</div>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={onChange}
                        className="hidden"
                    />
                </div>

                {file && (
                    <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border p-3 text-sm">
                        <div className="flex-1">
                            <div className="font-medium">{file.name}</div>
                            <div className="text-xs text-muted-foreground">{humanSize(file.size)}</div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearFile} disabled={uploading}>
                            <IconX className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                <DialogFooter className="mt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
                        Batal
                    </Button>
                    <Button onClick={upload} disabled={uploading || !file}>
                        {uploading ? 'Mengunggah...' : 'Unggah & Proses'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ────────────────────────────────────────────────────────────────────────────────
// Dialog Export (baru)
type ExportUsersDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: { id: number; name: string }[];
};

function ExportUsersDialog({ open, onOpenChange, roles }: ExportUsersDialogProps) {
    const [role, setRole] = useState<string>(ROLE_ALL);
    const [status, setStatus] = useState<string>(STATUS_ALL);

    const exportUrl = useMemo(() => {
        const params = new URLSearchParams();
        if (role !== ROLE_ALL) params.set('role', role);
        if (status !== STATUS_ALL) params.set('status', status);
        const qs = params.toString();
        return qs ? `/admin/users/export?${qs}` : `/admin/users/export`;
    }, [role, status]);

    const download = () => {
        toast.info('Menyiapkan file export...');
        window.open(exportUrl, '_blank', 'noopener');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Data User
                    </DialogTitle>
                    <DialogDescription>
                        Pilih kriteria export. File akan diunduh dalam format <b>.xlsx</b>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right">Role</Label>
                        <div className="col-span-3">
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ROLE_ALL}>Semua Role</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.name}>
                                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-3">
                        <Label className="text-right">Status</Label>
                        <div className="col-span-3">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={STATUS_ALL}>Semua Status</SelectItem>
                                    <SelectItem value={STATUS_ACTIVE}>Aktif</SelectItem>
                                    <SelectItem value={STATUS_INACTIVE}>Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="mt-1 text-xs text-muted-foreground">
                                • <span className="font-medium">Aktif</span> = email terverifikasi. • <span className="font-medium">Tidak Aktif</span>{' '}
                                = email belum terverifikasi.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                        URL: <span className="font-mono break-all text-foreground">{exportUrl}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Batal
                    </Button>
                    <Button onClick={download}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ────────────────────────────────────────────────────────────────────────────────
// Types
type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    roles: Array<{ name: string }>;
    siswa_profile?: {
        nis: string;
        angkatan: number;
        kelas: string;
    } | null;
    guru_profile?: {
        nidn: string;
        mapel_keahlian: string;
    } | null;
}

interface Role {
    id: number;
    name: string;
}

interface PaginatedUsers {
    data: User[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    users: PaginatedUsers;
    roles: Role[];
    filters: {
        search?: string;
        role?: string;
        status?: boolean | null;
    };
}

// ────────────────────────────────────────────────────────────────────────────────
// Page
export default function Users({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role ?? ROLE_ALL);
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status === true ? STATUS_ACTIVE : filters.status === false ? STATUS_INACTIVE : STATUS_ALL,
    );
    const [isLoading, setIsLoading] = useState(false);

    const [openImport, setOpenImport] = useState(false);
    const [openExport, setOpenExport] = useState(false);

    // Guard sederhana
    if (!users || !Array.isArray(users.data)) {
        console.error('Users data invalid:', users);
        return (
            <AppLayout>
                <Head title="Manajemen User" />
                <div className="p-4 text-red-600">Error: Data users tidak tersedia atau tidak valid.</div>
            </AppLayout>
        );
    }

    if (!roles || roles.length === 0) {
        console.error('Roles data missing:', roles);
        return (
            <AppLayout>
                <Head title="Manajemen User" />
                <div className="p-4 text-red-600">Error: Data roles tidak tersedia.</div>
            </AppLayout>
        );
    }

    const handleSearch = () => {
        const params: Record<string, string> = {};
        if (search.trim()) params.search = search.trim();
        if (selectedRole !== ROLE_ALL) params.role = selectedRole;
        if (selectedStatus !== STATUS_ALL) params.status = selectedStatus;

        router.get('/admin/users', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedRole(ROLE_ALL);
        setSelectedStatus(STATUS_ALL);
        router.get('/admin/users', {}, { preserveState: true, replace: true });
    };

    const handleToggleStatus = (userId: number) => {
        if (isLoading) return;

        setIsLoading(true);
        router.patch(
            `/admin/users/${userId}/toggle-status`,
            {},
            {
                onSuccess: () => {
                    toast.success('Status user berhasil diubah');
                },
                onError: () => {
                    toast.error('Gagal mengubah status user');
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    const handleResetPassword = (userId: number) => {
        setIsLoading(true);
        router.post(
            `/admin/users/${userId}/reset-password`,
            {},
            {
                onSuccess: () => toast.success('Password berhasil direset'),
                onError: () => toast.error('Gagal mereset password'),
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleDelete = (userId: number) => {
        setIsLoading(true);
        router.delete(`/admin/users/${userId}`, {
            onSuccess: () => toast.success('User berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus user'),
            onFinish: () => setIsLoading(false),
        });
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'guru':
                return 'bg-blue-100 text-blue-800';
            case 'siswa':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen User" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
                        <p className="text-muted-foreground">Kelola data pengguna sistem (Admin, Guru, Siswa)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOpenImport(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setOpenExport(true)}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button asChild>
                            <Link href="/admin/users/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah User
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama atau email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ROLE_ALL}>Semua Role</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={STATUS_ALL}>Semua Status</SelectItem>
                                    <SelectItem value={STATUS_ACTIVE}>Aktif</SelectItem>
                                    <SelectItem value={STATUS_INACTIVE}>Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} size="sm">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar User</CardTitle>
                        <CardDescription>Total: {users.total} user</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Info Tambahan</TableHead>
                                        <TableHead>Terdaftar</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="py-8 text-center">
                                                Tidak ada data user
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    {user.roles.map((role) => (
                                                        <Badge key={role.name} className={getRoleBadgeColor(role.name)}>
                                                            {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                        </Badge>
                                                    ))}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
                                                        {user.email_verified_at ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.siswa_profile && (
                                                        <div className="text-sm">
                                                            <div>NIS: {user.siswa_profile.nis}</div>
                                                            <div>Angkatan: {user.siswa_profile.angkatan}</div>
                                                            {user.siswa_profile.kelas && <div>Kelas: {user.siswa_profile.kelas}</div>}
                                                        </div>
                                                    )}
                                                    {user.guru_profile && (
                                                        <div className="text-sm">
                                                            <div>NIDN: {user.guru_profile.nidn}</div>
                                                            <div>Keahlian: {user.guru_profile.mapel_keahlian}</div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/users/${user.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id)} disabled={isLoading}>
                                                                {user.email_verified_at ? (
                                                                    <>
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        Nonaktifkan
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Aktifkan
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem onClick={() => handleResetPassword(user.id)} disabled={isLoading}>
                                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                                Reset Password
                                                            </DropdownMenuItem>

                                                            <ConfirmDeleteDialog
                                                                trigger={
                                                                    <DropdownMenuItem
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        className="text-red-600 focus:text-red-700"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Hapus
                                                                    </DropdownMenuItem>
                                                                }
                                                                title={`Hapus user "${user.name}"?`}
                                                                description={`Email: ${user.email}. Tindakan ini tidak dapat dibatalkan.`}
                                                                confirmWord="HAPUS"
                                                                onConfirm={() => handleDelete(user.id)}
                                                                isLoading={isLoading}
                                                            />
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {(users.last_page ?? 1) > 1 && (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {users.from ?? 0} - {users.to ?? 0} dari {users.total} user
                                </div>

                                {/* tombol-tombol pagination sekarang persis di samping teks */}
                                <div className="flex items-center gap-2">
                                    {users.links.map((link, index) => {
                                        if (link.label.includes('Previous')) {
                                            return (
                                                <Button
                                                    key={`prev-${index}`}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    Previous
                                                </Button>
                                            );
                                        }
                                        if (link.label.includes('Next')) {
                                            return (
                                                <Button
                                                    key={`next-${index}`}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    Next
                                                </Button>
                                            );
                                        }
                                        if (!link.label.includes('...')) {
                                            return (
                                                <Button
                                                    key={`page-${index}`}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    {link.label}
                                                </Button>
                                            );
                                        }
                                        return (
                                            <span key={`dots-${index}`} className="px-2">
                                                ...
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialog Import */}
            <ImportUsersDialog
                open={openImport}
                onOpenChange={setOpenImport}
                onDone={() => {
                    router.reload({ only: ['users'] });
                }}
            />

            {/* Dialog Export */}
            <ExportUsersDialog open={openExport} onOpenChange={setOpenExport} roles={roles} />
        </AppLayout>
    );
}
