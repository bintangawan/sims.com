<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Pagination\Paginator;
use Carbon\Carbon;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register custom services here if needed
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS in production
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // Set Carbon locale to Indonesian
        Carbon::setLocale('id');
        
        // Use Bootstrap 4 for pagination views (optional)
        // Paginator::useBootstrap();
        
        // Define global gates for common permissions
        Gate::define('manage-announcements', function ($user) {
            return $user->hasAnyRole(['admin', 'guru']);
        });
        
        Gate::define('manage-global-announcements', function ($user) {
            return $user->hasRole('admin');
        });
        
        Gate::define('view-admin-dashboard', function ($user) {
            return $user->hasRole('admin');
        });
        
        Gate::define('view-guru-dashboard', function ($user) {
            return $user->hasRole('guru');
        });
        
        Gate::define('view-siswa-dashboard', function ($user) {
            return $user->hasRole('siswa');
        });
        
        // Define gate for section access
        Gate::define('access-section', function ($user, $section) {
            if ($user->hasRole('admin')) {
                return true;
            }
            
            if ($user->hasRole('guru')) {
                return $section->guru_id === $user->id;
            }
            
            if ($user->hasRole('siswa')) {
                $siswa = $user->siswaProfile;
                return $siswa && $siswa->sections()->where('sections.id', $section->id)->exists();
            }
            
            return false;
        });
        
        // Define gate for assignment access
        Gate::define('access-assignment', function ($user, $assignment) {
            return Gate::allows('access-section', $assignment->section);
        });
        
        // Define gate for submission access
        Gate::define('access-submission', function ($user, $submission) {
            if ($user->hasRole('admin')) {
                return true;
            }
            
            if ($user->hasRole('guru')) {
                return $submission->assignment->section->guru_id === $user->id;
            }
            
            if ($user->hasRole('siswa')) {
                return $submission->user_id === $user->id;
            }
            
            return false;
        });
    }
}
