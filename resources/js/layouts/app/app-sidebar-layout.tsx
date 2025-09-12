import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import ChatWidget from '@/components/Chatbot/ChatWidget';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { auth } = usePage<SharedData>().props;
    
    // Extract user role from auth data
    const userRole = auth?.user?.roles?.[0]?.name || 'siswa';
    const isAuthenticated = !!auth?.user;

    return (
        <AppShell variant="sidebar">
            <AppSidebar userRole={userRole} />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            
            {/* ChatWidget akan muncul di semua halaman */}
            <ChatWidget 
                isAuthenticated={isAuthenticated}
                userRole={userRole as 'admin' | 'guru' | 'siswa'}
            />
        </AppShell>
    );
}
