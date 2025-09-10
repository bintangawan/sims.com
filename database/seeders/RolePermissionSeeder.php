<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Dashboard permissions
            'view-dashboard',
            
            // Master Data permissions (Admin only)
            'manage-master-data',
            'manage-terms',
            'manage-subjects',
            'manage-sections',
            
            // User Management permissions (Admin only)
            'manage-users',
            'assign-roles',
            'import-users',
            
            // Section/Class permissions
            'view-sections',
            'manage-sections',
            'view-section-students',
            'manage-section-students',
            
            // Material permissions
            'view-materials',
            'create-materials',
            'edit-materials',
            'delete-materials',
            
            // Assignment permissions
            'view-assignments',
            'create-assignments',
            'edit-assignments',
            'delete-assignments',
            'submit-assignments',
            
            // Grading permissions
            'view-grades',
            'manage-grades',
            'view-own-grades',
            
            // Attendance permissions
            'view-attendance',
            'manage-attendance',
            'view-own-attendance',
            
            // Announcement permissions
            'view-announcements',
            'create-announcements',
            'edit-announcements',
            'delete-announcements',
            
            // Report permissions (Admin only)
            'view-reports',
            'export-reports',
            
            // Chatbot permissions
            'use-chatbot',
            'manage-chatbot-config',
            
            // Schedule permissions
            'view-schedule',
            'manage-schedule',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin role - full access
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Guru role
        $guruRole = Role::create(['name' => 'guru']);
        $guruRole->givePermissionTo([
            'view-dashboard',
            'view-sections',
            'manage-sections', // for their own sections
            'view-section-students',
            'manage-section-students',
            'view-materials',
            'create-materials',
            'edit-materials',
            'delete-materials',
            'view-assignments',
            'create-assignments',
            'edit-assignments',
            'delete-assignments',
            'view-grades',
            'manage-grades',
            'view-attendance',
            'manage-attendance',
            'view-announcements',
            'create-announcements',
            'edit-announcements',
            'delete-announcements',
            'use-chatbot',
            'view-schedule',
        ]);

        // Siswa role
        $siswaRole = Role::create(['name' => 'siswa']);
        $siswaRole->givePermissionTo([
            'view-dashboard',
            'view-sections',
            'view-section-students',
            'view-materials',
            'view-assignments',
            'submit-assignments',
            'view-own-grades',
            'view-own-attendance',
            'view-announcements',
            'use-chatbot',
            'view-schedule',
        ]);
    }
}