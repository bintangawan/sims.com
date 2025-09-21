<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;

class AnnouncementController extends Controller
{
    /**
     * Display announcements based on user role
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        $query = Announcement::with(['creator', 'scopeSection.subject'])
            ->orderBy('published_at', 'desc');
    
        // Filter based on user role and access
        if ($userRole === 'siswa') {
            // Apply published filter for students
            $query->published();
            
            $siswa = $user->siswaProfile;
            if ($siswa) {
                $sectionIds = $siswa->sections()->pluck('sections.id');
                $query->where(function($q) use ($sectionIds) {
                    $q->where('scope_type', 'global')
                      ->orWhere(function($q2) {
                          $q2->where('scope_type', 'role')
                             ->where('role_name', 'siswa');
                      })
                      ->orWhere(function($q3) use ($sectionIds) {
                          $q3->where('scope_type', 'section')
                             ->whereIn('scope_id', $sectionIds);
                      });
                });
            } else {
                $query->forRole('siswa');
            }
        } elseif ($userRole === 'guru') {
            // Remove published filter for teachers - they should see all their announcements
            // $query->published(); // Commented out to show both published and unpublished
            
            $guru = $user->guruProfile;
            if ($guru) {
                $sectionIds = Section::where('guru_id', $user->id)->pluck('id');
                $query->where(function($q) use ($sectionIds, $user) {
                    $q->where(function($q1) use ($sectionIds) {
                        // Show announcements they can access (published ones)
                        $q1->where(function($q2) use ($sectionIds) {
                            $q2->where('scope_type', 'global')
                              ->orWhere(function($q3) {
                                  $q3->where('scope_type', 'role')
                                     ->where('role_name', 'guru');
                              })
                              ->orWhere(function($q4) use ($sectionIds) {
                                  $q4->where('scope_type', 'section')
                                     ->whereIn('scope_id', $sectionIds);
                              });
                        })->where(function($q5) {
                            $q5->whereNotNull('published_at')
                               ->where('published_at', '<=', now());
                        });
                    })->orWhere(function($q6) use ($user) {
                        // Also show all announcements they created (regardless of publication status)
                        $q6->where('created_by', $user->id);
                    });
                });
            } else {
                // If no guru profile, show role-based announcements and their own created ones
                $query->where(function($q) use ($user) {
                    $q->where(function($q1) {
                        $q1->forRole('guru')->where(function($q2) {
                            $q2->whereNotNull('published_at')
                               ->where('published_at', '<=', now());
                        });
                    })->orWhere('created_by', $user->id);
                });
            }
        }
        // Admin can see ALL announcements (no additional filtering)
        // Remove the published() filter for admin to see all announcements
    
        // Filter by scope type if requested
        if ($request->has('scope_type') && $request->scope_type !== '') {
            $query->where('scope_type', $request->scope_type);
        }
    
        $announcements = $query->paginate(10)->withQueryString();
    
        $pageComponent = match($userRole) {
            'siswa' => 'Siswa/Announcements/Index',
            'guru' => 'Guru/Announcements/Index',
            'admin' => 'Admin/Announcements/Index',
            default => 'Shared/Announcements/Index'
        };
    
        return Inertia::render($pageComponent, [
            'announcements' => $announcements,
            'userRole' => $userRole,
            'filters' => $request->only(['scope_type']),
        ]);
    }

    /**
     * Show announcement details
     */
    public function show(Announcement $announcement)
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        // Check if user can access this announcement
        if (!$this->canAccessAnnouncement($announcement, $user)) {
            abort(403, 'Anda tidak memiliki akses ke pengumuman ini.');
        }

        $announcement->load(['creator', 'scopeSection.subject']);

        $pageComponent = match($userRole) {
            'siswa' => 'Siswa/Announcements/Show',
            'guru' => 'Guru/Announcements/Show',
            'admin' => 'Admin/Announcements/Show',
            default => 'Shared/Announcements/Show'
        };

        return Inertia::render($pageComponent, [
            'announcement' => $announcement,
            'userRole' => $userRole,
        ]);
    }

    /**
     * Show form for creating announcement (Guru & Admin only)
     */
    public function create()
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        if (!in_array($userRole, ['guru', 'admin'])) {
            abort(403, 'Anda tidak memiliki akses untuk membuat pengumuman.');
        }

        $sections = [];
        if ($userRole === 'guru') {
            $sections = Section::where('guru_id', $user->id)
                ->with(['subject', 'term'])
                ->get();
        } elseif ($userRole === 'admin') {
            $sections = Section::with(['subject', 'guru', 'term'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $pageComponent = match($userRole) {
            'guru' => 'Guru/Announcements/Create',
            'admin' => 'Admin/Announcements/Create',
            default => 'Shared/Announcements/Create'
        };

        return Inertia::render($pageComponent, [
            'sections' => $sections,
            'userRole' => $userRole,
        ]);
    }

    /**
     * Store new announcement
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        if (!in_array($userRole, ['guru', 'admin'])) {
            abort(403, 'Anda tidak memiliki akses untuk membuat pengumuman.');
        }
    
        $rules = [
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'scope_type' => 'required|in:global,section,role',
            'scope_id' => 'nullable|exists:sections,id',
            'role_name' => 'nullable|in:siswa,guru,admin',
            'published_at' => 'nullable|date|after_or_equal:now',
        ];
    
        // Additional validation based on scope_type
        if ($request->input('scope_type') === 'section') {
            $rules['scope_id'] = 'required|exists:sections,id';
        }
        if ($request->input('scope_type') === 'role') {
            $rules['role_name'] = 'required|in:siswa,guru,admin';
        }
    
        $validator = Validator::make($request->all(), $rules);
    
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
    
        // Additional authorization checks
        if ($userRole === 'guru') {
            // Guru can only create announcements for their sections or role-based
            if ($request->input('scope_type') === 'section') {
                $section = Section::find($request->input('scope_id'));
                if (!$section || $section->guru_id !== $user->id) {
                    return redirect()->back()
                        ->with('error', 'Anda hanya dapat membuat pengumuman untuk kelas yang Anda ajar.')
                        ->withInput();
                }
            } elseif ($request->input('scope_type') === 'global') {
                return redirect()->back()
                    ->with('error', 'Anda tidak memiliki akses untuk membuat pengumuman global.')
                    ->withInput();
            }
        }
    
        try {
            // Fix: Properly handle null values based on scope_type
            $scopeId = null;
            $roleName = null;
            
            if ($request->input('scope_type') === 'section') {
                $scopeId = $request->input('scope_id');
            } elseif ($request->input('scope_type') === 'role') {
                $roleName = $request->input('role_name');
            }
            // For global scope_type, both remain null
    
            $announcementData = [
                'title' => $request->input('title'),
                'content' => $request->input('content'),
                'scope_type' => $request->input('scope_type'),
                'scope_id' => $scopeId,
                'role_name' => $roleName,
                'published_at' => $request->input('published_at') ? Carbon::parse($request->input('published_at')) : now(),
                'created_by' => $user->id,
            ];
    
            Announcement::create($announcementData);
    
            $redirectRoute = match($userRole) {
                'guru' => 'guru.announcements.index',
                'admin' => 'admin.announcements.index',
                default => 'announcements.index'
            };
    
            return redirect()->route($redirectRoute)
                ->with('success', 'Pengumuman berhasil dibuat.');
    
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal membuat pengumuman: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Show form for editing announcement
     */
    public function edit(Announcement $announcement)
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        if (!$this->canEditAnnouncement($announcement, $user)) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengumuman ini.');
        }

        $sections = [];
        if ($userRole === 'guru') {
            $sections = Section::where('guru_id', $user->id)
                ->with(['subject', 'term'])
                ->get();
        } elseif ($userRole === 'admin') {
            $sections = Section::with(['subject', 'guru', 'term'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $pageComponent = match($userRole) {
            'guru' => 'Guru/Announcements/Edit',
            'admin' => 'Admin/Announcements/Edit',
            default => 'Shared/Announcements/Edit'
        };

        return Inertia::render($pageComponent, [
            'announcement' => $announcement,
            'sections' => $sections,
            'userRole' => $userRole,
        ]);
    }

    /**
     * Update announcement
     */
    public function update(Request $request, Announcement $announcement)
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        if (!$this->canEditAnnouncement($announcement, $user)) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit pengumuman ini.');
        }

        $rules = [
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'scope_type' => 'required|in:global,section,role',
            'scope_id' => 'nullable|exists:sections,id',
            'role_name' => 'nullable|in:siswa,guru,admin',
            'published_at' => 'nullable|date',
        ];

        // Additional validation based on scope_type
        if ($request->scope_type === 'section') {
            $rules['scope_id'] = 'required|exists:sections,id';
        }
        if ($request->scope_type === 'role') {
            $rules['role_name'] = 'required|in:siswa,guru,admin';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Additional authorization checks for guru
        if ($userRole === 'guru') {
            if ($request->scope_type === 'section') {
                $section = Section::find($request->scope_id);
                if (!$section || $section->guru_id !== $user->id) {
                    return redirect()->back()
                        ->with('error', 'Anda hanya dapat mengedit pengumuman untuk kelas yang Anda ajar.')
                        ->withInput();
                }
            } elseif ($request->scope_type === 'global') {
                return redirect()->back()
                    ->with('error', 'Anda tidak memiliki akses untuk membuat pengumuman global.')
                    ->withInput();
            }
        }

        try {
            $updateData = [
                'title' => $request->input('title'),
                'content' => $request->input('content'),
                'scope_type' => $request->input('scope_type'),
                'scope_id' => $request->input('scope_id'),
                'role_name' => $request->input('role_name'),
                'published_at' => $request->input('published_at') ? Carbon::parse($request->input('published_at')) : $announcement->published_at,
            ];

            $announcement->update($updateData);

            $redirectRoute = match($userRole) {
                'guru' => 'guru.announcements.index',
                'admin' => 'admin.announcements.index',
                default => 'announcements.index'
            };

            return redirect()->route($redirectRoute)
                ->with('success', 'Pengumuman berhasil diperbarui.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal memperbarui pengumuman: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Delete announcement
     */
    public function destroy(Announcement $announcement)
    {
        $user = Auth::user();
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        if (!$this->canEditAnnouncement($announcement, $user)) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus pengumuman ini.');
        }

        try {
            $announcement->delete();

            $redirectRoute = match($userRole) {
                'guru' => 'guru.announcements.index',
                'admin' => 'admin.announcements.index',
                default => 'announcements.index'
            };

            return redirect()->route($redirectRoute)
                ->with('success', 'Pengumuman berhasil dihapus.');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus pengumuman: ' . $e->getMessage());
        }
    }

    /**
     * Check if user can access announcement
     */
    private function canAccessAnnouncement(Announcement $announcement, $user)
    {
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        // Admin can access all announcements
        if ($userRole === 'admin') {
            return true;
        }

        // Check scope-based access
        if ($announcement->scope_type === 'global') {
            return true;
        }

        if ($announcement->scope_type === 'role') {
            return $announcement->role_name === $userRole;
        }

        if ($announcement->scope_type === 'section') {
            if ($userRole === 'guru') {
                $section = Section::find($announcement->scope_id);
                return $section && $section->guru_id === $user->id;
            } elseif ($userRole === 'siswa') {
                $siswa = $user->siswaProfile;
                if ($siswa) {
                    return $siswa->sections()->where('sections.id', $announcement->scope_id)->exists();
                }
            }
        }

        return false;
    }

    /**
     * Check if user can edit announcement
     */
    private function canEditAnnouncement(Announcement $announcement, $user)
    {
        $userRole = $user->roles->first()->name ?? 'siswa';
        
        // Admin can edit all announcements
        if ($userRole === 'admin') {
            return true;
        }

        // Users can only edit their own announcements
        if ($announcement->created_by !== $user->id) {
            return false;
        }

        // Guru can edit their announcements
        if ($userRole === 'guru') {
            return true;
        }

        return false;
    }
}