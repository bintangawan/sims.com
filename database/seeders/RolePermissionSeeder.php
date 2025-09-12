<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // reset cache spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view-dashboard',
            'manage-master-data','manage-terms','manage-subjects',
            'manage-users','assign-roles','import-users',
            'view-sections','manage-sections','view-section-students','manage-section-students',
            'view-materials','create-materials','edit-materials','delete-materials',
            'view-assignments','create-assignments','edit-assignments','delete-assignments','submit-assignments',
            'view-grades','manage-grades','view-own-grades',
            'view-attendance','manage-attendance','view-own-attendance',
            'view-announcements','create-announcements','edit-announcements','delete-announcements',
            'view-reports','export-reports',
            'use-chatbot','manage-chatbot-config',
            'view-schedule','manage-schedule',
        ];
        $permissions = array_values(array_unique($permissions));

        // idempotent: findOrCreate
        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        // roles idempotent
        $admin = Role::findOrCreate('admin', 'web');
        $guru  = Role::findOrCreate('guru',  'web');
        $siswa = Role::findOrCreate('siswa', 'web');

        // Admin: semua permission
        $admin->syncPermissions(Permission::all());

        // Guru: subset
        $guruPerms = [
            'view-dashboard','view-sections','manage-sections',
            'view-section-students','manage-section-students',
            'view-materials','create-materials','edit-materials','delete-materials',
            'view-assignments','create-assignments','edit-assignments','delete-assignments',
            'view-grades','manage-grades',
            'view-attendance','manage-attendance',
            'view-announcements','create-announcements','edit-announcements','delete-announcements',
            'use-chatbot','view-schedule',
        ];
        $guru->syncPermissions($guruPerms);

        // Siswa: subset
        $siswaPerms = [
            'view-dashboard','view-sections','view-section-students',
            'view-materials','view-assignments','submit-assignments',
            'view-own-grades','view-own-attendance',
            'view-announcements','use-chatbot','view-schedule',
        ];
        $siswa->syncPermissions($siswaPerms);

        // reset cache lagi (opsional)
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
