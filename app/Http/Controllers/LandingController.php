<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Term;
use App\Models\User;
use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LandingController extends Controller
{
    /**
     * Display the landing page
     */
    public function index()
    {
        // Get current term
        $currentTerm = Term::where('aktif', true)->first();
        
        // Get public announcements (global scope only)
        $announcements = Announcement::published()
            ->where('scope_type', 'global')
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get(['id', 'title', 'content', 'published_at']);

        // Get basic statistics (public info)
        $statistics = [
            'total_students' => User::role('siswa')->count(),
            'total_teachers' => User::role('guru')->count(),
            'total_subjects' => Section::distinct('subject_id')->count('subject_id'),
            'current_term' => $currentTerm?->tahun . ' - ' . ucfirst($currentTerm?->semester ?? ''),
        ];

        // School information (you can move this to config or database)
        $schoolInfo = [
            'name' => 'SIMS - Sistem Informasi Manajemen Sekolah',
            'description' => 'Platform pembelajaran digital yang menghubungkan siswa, guru, dan administrasi sekolah dalam satu sistem terintegrasi.',
            'features' => [
                [
                    'title' => 'Pembelajaran Digital',
                    'description' => 'Akses materi pembelajaran, tugas, dan penilaian secara online',
                    'icon' => 'book-open'
                ],
                [
                    'title' => 'Manajemen Kelas',
                    'description' => 'Kelola kelas, jadwal, dan absensi dengan mudah',
                    'icon' => 'users'
                ],
                [
                    'title' => 'Komunikasi Terintegrasi',
                    'description' => 'Pengumuman dan chatbot AI untuk bantuan 24/7',
                    'icon' => 'message-circle'
                ],
                [
                    'title' => 'Laporan & Analitik',
                    'description' => 'Pantau progress belajar dengan laporan komprehensif',
                    'icon' => 'bar-chart'
                ]
            ]
        ];

        // FAQ for chatbot context
        $faq = [
            [
                'question' => 'Bagaimana cara login ke sistem?',
                'answer' => 'Gunakan email dan password yang telah diberikan oleh sekolah. Jika lupa password, hubungi administrator.'
            ],
            [
                'question' => 'Apa saja fitur yang tersedia?',
                'answer' => 'SIMS menyediakan fitur pembelajaran digital, manajemen kelas, komunikasi terintegrasi, dan laporan analitik.'
            ],
            [
                'question' => 'Bagaimana cara mengakses materi pembelajaran?',
                'answer' => 'Setelah login, siswa dapat mengakses materi melalui menu Kelas atau Materi di dashboard.'
            ],
            [
                'question' => 'Apakah ada aplikasi mobile?',
                'answer' => 'Saat ini SIMS dapat diakses melalui web browser di perangkat mobile dengan tampilan responsif.'
            ]
        ];

        return Inertia::render('Landing', [
            'currentTerm' => $currentTerm,
            'announcements' => $announcements,
            'statistics' => $statistics,
            'schoolInfo' => $schoolInfo,
            'faq' => $faq,
            'canLogin' => true,
            'canRegister' => false, // Set to true if registration is allowed
        ]);
    }

    /**
     * Display about page
     */
    public function about()
    {
        $schoolInfo = [
            'name' => 'SIMS - Sistem Informasi Manajemen Sekolah',
            'vision' => 'Menjadi platform pembelajaran digital terdepan yang menghubungkan seluruh ekosistem pendidikan.',
            'mission' => [
                'Menyediakan platform pembelajaran yang mudah digunakan dan terintegrasi',
                'Memfasilitasi komunikasi efektif antara siswa, guru, dan administrasi',
                'Mendukung digitalisasi proses akademik dan administratif sekolah',
                'Memberikan analitik dan laporan untuk meningkatkan kualitas pendidikan'
            ],
            'features' => [
                'Manajemen Pembelajaran Digital',
                'Sistem Absensi Terintegrasi', 
                'Penilaian dan Rapor Online',
                'Komunikasi Multi-Channel',
                'Chatbot AI Assistant',
                'Laporan dan Analitik Komprehensif'
            ],
            'technology' => [
                'Laravel 12 - Backend Framework',
                'React + TypeScript - Frontend',
                'Inertia.js - SPA Experience',
                'TailwindCSS + shadcn/ui - UI Framework',
                'MySQL - Database',
                'Gemini AI - Chatbot Integration'
            ]
        ];

        return Inertia::render('About', [
            'schoolInfo' => $schoolInfo
        ]);
    }

    /**
     * Display contact page
     */
    public function contact()
    {
        $contactInfo = [
            'school' => [
                'name' => 'SIMS School',
                'address' => 'Jl. Pendidikan No. 123, Jakarta',
                'phone' => '+62 21 1234 5678',
                'email' => 'info@sims-school.edu',
                'website' => 'https://sims-school.edu'
            ],
            'support' => [
                'technical' => 'support@sims-school.edu',
                'academic' => 'academic@sims-school.edu',
                'admin' => 'admin@sims-school.edu'
            ],
            'hours' => [
                'weekdays' => '07:00 - 16:00 WIB',
                'saturday' => '07:00 - 12:00 WIB',
                'sunday' => 'Tutup'
            ]
        ];

        return Inertia::render('Contact', [
            'contactInfo' => $contactInfo
        ]);
    }
}