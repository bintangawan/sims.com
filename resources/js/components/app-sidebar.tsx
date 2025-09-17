import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Bot,
    Calendar,
    ClipboardList,
    FileText,
    Folder,
    GraduationCap,
    LayoutGrid,
    MessageSquare,
    Settings,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

interface AppSidebarProps {
    userRole?: string;
}

// Helper function to generate navigation items based on user role
const getNavigationItems = (role: string): NavItem[] => {
    const baseItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: `/${role}/dashboard`,
            icon: LayoutGrid,
        },
    ];

    switch (role) {
        case 'admin':
            return [
                ...baseItems,
                {
                    title: 'Master Data',
                    href: '/admin/master-data',
                    icon: Settings,
                },
                {
                    title: 'Manajemen User',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Jadwal',
                    href: '/admin/jadwal',
                    icon: Calendar,
                },
                {
                    title: 'Laporan',
                    href: '/admin/laporan',
                    icon: FileText,
                },
                {
                    title: 'Pengumuman',
                    href: '/admin/announcements',
                    icon: MessageSquare,
                },
                {
                    title: 'Konfigurasi Chatbot',
                    href: '/admin/chatbot-config',
                    icon: Bot,
                },
            ];

        case 'guru':
            return [
                ...baseItems,
                {
                    title: 'Kelas Saya',
                    href: '/guru/kelas',
                    icon: GraduationCap,
                },
                {
                    title: 'Penilaian',
                    href: '/guru/penilaian',
                    icon: FileText,
                },
                {
                    title: 'Tugas',
                    href: '/guru/tugas',
                    icon: FileText,
                },
                {
                    title: 'Pengumuman',
                    href: '/guru/announcements',
                    icon: MessageSquare,
                },
            ];

        case 'siswa':
            return [
                ...baseItems,
                {
                    title: 'Jadwal',
                    href: '/siswa/jadwal',
                    icon: Calendar,
                },
                {
                    title: 'Tugas',
                    href: '/siswa/tugas',
                    icon: ClipboardList,
                },
                {
                    title: 'Nilai',
                    href: '/siswa/nilai',
                    icon: FileText,
                },
                {
                    title: 'Absensi',
                    href: '/siswa/absensi',
                    icon: UserCheck,
                },
                {
                    title: 'Pengumuman',
                    href: '/siswa/announcements',
                    icon: MessageSquare,
                },
            ];

        default:
            return baseItems;
    }
};

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar({ userRole = 'siswa' }: AppSidebarProps) {
    const mainNavItems = getNavigationItems(userRole);
    const dashboardHref = userRole ? `/${userRole}/dashboard` : dashboard();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
