// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Separator } from '@/components/ui/separator';
// import AppLayout from '@/layouts/app-layout';
// import { Head, Link } from '@inertiajs/react';
// import { ArrowLeft, BookOpen, Calendar, Edit, GraduationCap, Mail, Phone, User } from 'lucide-react';
// // CardDescription
// interface User {
//     id: number;
//     name: string;
//     email: string;
//     email_verified_at: string | null;
//     created_at: string;
//     updated_at: string;
//     roles: Array<{ name: string }>;
//     siswa_profile?: {
//         nis: string;
//         angkatan: number;
//         kelas: string;
//         wali_kelas_id?: number;
//     } | null;
//     guru_profile?: {
//         nidn: string;
//         nuptk: string;
//         mapel_keahlian: string;
//         telepon: string;
//     } | null;
// }

// interface Props {
//     user: User;
// }

// export default function Show({ user }: Props) {
//     const getRoleBadgeColor = (role: string) => {
//         switch (role) {
//             case 'admin':
//                 return 'bg-red-100 text-red-800';
//             case 'guru':
//                 return 'bg-blue-100 text-blue-800';
//             case 'siswa':
//                 return 'bg-green-100 text-green-800';
//             default:
//                 return 'bg-gray-100 text-gray-800';
//         }
//     };

//     return (
//         <AppLayout>
//             <Head title={`Detail User - ${user.name}`} />

//             <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <Button variant="outline" size="sm" asChild>
//                             <Link href="/admin/users">
//                                 <ArrowLeft className="mr-2 h-4 w-4" />
//                                 Kembali
//                             </Link>
//                         </Button>
//                         <div>
//                             <h1 className="text-3xl font-bold tracking-tight">Detail User</h1>
//                             <p className="text-muted-foreground">Informasi lengkap pengguna</p>
//                         </div>
//                     </div>
//                     <Button asChild>
//                         <Link href={`/admin/users/${user.id}/edit`}>
//                             <Edit className="mr-2 h-4 w-4" />
//                             Edit User
//                         </Link>
//                     </Button>
//                 </div>

//                 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//                     {/* Main Info */}
//                     <div className="space-y-6 lg:col-span-2">
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle className="flex items-center gap-2">
//                                     <User className="h-5 w-5" />
//                                     Informasi Dasar
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent className="space-y-4">
//                                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                                     <div>
//                                         <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
//                                         <p className="text-lg font-semibold">{user.name}</p>
//                                     </div>
//                                     <div>
//                                         <label className="text-sm font-medium text-muted-foreground">Email</label>
//                                         <div className="flex items-center gap-2">
//                                             <Mail className="h-4 w-4 text-muted-foreground" />
//                                             <p>{user.email}</p>
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label className="text-sm font-medium text-muted-foreground">Role</label>
//                                         <div className="mt-1 flex gap-2">
//                                             {user.roles.map((role) => (
//                                                 <Badge key={role.name} className={getRoleBadgeColor(role.name)}>
//                                                     {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
//                                                 </Badge>
//                                             ))}
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <label className="text-sm font-medium text-muted-foreground">Status</label>
//                                         <div className="mt-1">
//                                             <Badge variant={user.email_verified_at ? 'default' : 'secondary'}>
//                                                 {user.email_verified_at ? 'Aktif' : 'Tidak Aktif'}
//                                             </Badge>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         {/* Siswa Profile */}
//                         {user.siswa_profile && (
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle className="flex items-center gap-2">
//                                         <GraduationCap className="h-5 w-5" />
//                                         Informasi Siswa
//                                     </CardTitle>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">NIS</label>
//                                             <p className="font-semibold">{user.siswa_profile.nis}</p>
//                                         </div>
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">Angkatan</label>
//                                             <p className="font-semibold">{user.siswa_profile.angkatan}</p>
//                                         </div>
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">Kelas</label>
//                                             <p className="font-semibold">{user.siswa_profile.kelas || '-'}</p>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         )}

//                         {/* Guru Profile */}
//                         {user.guru_profile && (
//                             <Card>
//                                 <CardHeader>
//                                     <CardTitle className="flex items-center gap-2">
//                                         <BookOpen className="h-5 w-5" />
//                                         Informasi Guru
//                                     </CardTitle>
//                                 </CardHeader>
//                                 <CardContent>
//                                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">NIDN</label>
//                                             <p className="font-semibold">{user.guru_profile.nidn || '-'}</p>
//                                         </div>
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">NUPTK</label>
//                                             <p className="font-semibold">{user.guru_profile.nuptk || '-'}</p>
//                                         </div>
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">Mata Pelajaran/Keahlian</label>
//                                             <p className="font-semibold">{user.guru_profile.mapel_keahlian || '-'}</p>
//                                         </div>
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">Telepon</label>
//                                             <div className="flex items-center gap-2">
//                                                 <Phone className="h-4 w-4 text-muted-foreground" />
//                                                 <p className="font-semibold">{user.guru_profile.telepon || '-'}</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         )}
//                     </div>

//                     {/* Sidebar Info */}
//                     <div className="space-y-6">
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle className="flex items-center gap-2">
//                                     <Calendar className="h-5 w-5" />
//                                     Informasi Akun
//                                 </CardTitle>
//                             </CardHeader>
//                             <CardContent className="space-y-4">
//                                 <div>
//                                     <label className="text-sm font-medium text-muted-foreground">Terdaftar</label>
//                                     <p className="text-sm">
//                                         {new Date(user.created_at).toLocaleDateString('id-ID', {
//                                             weekday: 'long',
//                                             year: 'numeric',
//                                             month: 'long',
//                                             day: 'numeric',
//                                         })}
//                                     </p>
//                                 </div>
//                                 <Separator />
//                                 <div>
//                                     <label className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</label>
//                                     <p className="text-sm">
//                                         {new Date(user.updated_at).toLocaleDateString('id-ID', {
//                                             weekday: 'long',
//                                             year: 'numeric',
//                                             month: 'long',
//                                             day: 'numeric',
//                                         })}
//                                     </p>
//                                 </div>
//                                 {user.email_verified_at && (
//                                     <>
//                                         <Separator />
//                                         <div>
//                                             <label className="text-sm font-medium text-muted-foreground">Email Diverifikasi</label>
//                                             <p className="text-sm">
//                                                 {new Date(user.email_verified_at).toLocaleDateString('id-ID', {
//                                                     weekday: 'long',
//                                                     year: 'numeric',
//                                                     month: 'long',
//                                                     day: 'numeric',
//                                                 })}
//                                             </p>
//                                         </div>
//                                     </>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }
