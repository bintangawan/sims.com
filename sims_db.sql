-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 15, 2025 at 01:11 PM
-- Server version: 8.0.30
-- PHP Version: 8.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sims_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint UNSIGNED NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `scope_type` enum('global','section','role') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'global',
  `scope_id` bigint UNSIGNED DEFAULT NULL,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_by` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `scope_type`, `scope_id`, `role_name`, `published_at`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'SPP', 'Bayar SPP Kalian ya Anak-Anak', 'global', NULL, NULL, '2025-09-15 09:45:00', 1, '2025-09-15 02:45:31', '2025-09-15 02:45:31'),
(2, 'Boi', 'jajan boi', 'role', NULL, 'siswa', '2025-09-15 10:05:00', 1, '2025-09-15 03:05:21', '2025-09-15 03:05:21'),
(3, 'Jajanan', 'jajanan di meja guru yaaa', 'role', NULL, 'guru', '2025-09-16 00:10:00', 1, '2025-09-15 03:10:51', '2025-09-15 03:23:46');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` bigint UNSIGNED NOT NULL,
  `section_id` bigint UNSIGNED NOT NULL,
  `judul` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` enum('file','teks','link','campuran') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'file',
  `deadline` datetime NOT NULL,
  `rubrik_json` json DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` bigint UNSIGNED NOT NULL,
  `section_id` bigint UNSIGNED NOT NULL,
  `pertemuan_ke` smallint UNSIGNED NOT NULL,
  `tanggal` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_details`
--

CREATE TABLE `attendance_details` (
  `id` bigint UNSIGNED NOT NULL,
  `attendance_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `status` enum('hadir','izin','sakit','alpha') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hadir',
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_356a192b7913b04c54574d18c28d46e6395428ab', 'i:1;', 1757644335),
('laravel_cache_356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1757644335;', 1757644335);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_configs`
--

CREATE TABLE `chat_configs` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value_json` json NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` bigint UNSIGNED NOT NULL,
  `session_id` bigint UNSIGNED NOT NULL,
  `sender` enum('user','bot') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `meta_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` enum('landing','siswa','guru','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'landing',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` bigint UNSIGNED NOT NULL,
  `section_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `komponen` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `skor` decimal(5,2) NOT NULL,
  `bobot` decimal(5,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guru_profiles`
--

CREATE TABLE `guru_profiles` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `nidn` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nuptk` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mapel_keahlian` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telepon` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guru_profiles`
--

INSERT INTO `guru_profiles` (`id`, `user_id`, `nidn`, `nuptk`, `mapel_keahlian`, `telepon`, `created_at`, `updated_at`) VALUES
(1, 2, '1234567890', NULL, 'Matematika', '081234567890', '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(2, 3, '1234567891', NULL, 'Bahasa Indonesia', '081234567891', '2025-09-10 19:24:00', '2025-09-10 19:24:00'),
(3, 4, '1234567892', NULL, 'IPA', '081234567892', '2025-09-10 19:24:00', '2025-09-10 19:24:00'),
(4, 12, '088222', '288393', 'Matematika, IPA, IPS', '089922', '2025-09-14 01:32:38', '2025-09-14 01:32:38');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` bigint UNSIGNED NOT NULL,
  `section_id` bigint UNSIGNED NOT NULL,
  `judul` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_09_08_100144_create_permission_tables', 1),
(5, '2025_09_08_100158_create_notifications_table', 1),
(6, '2025_09_08_125428_create_siswa_profiles_table', 1),
(7, '2025_09_08_125429_create_guru_profiles_table', 1),
(8, '2025_09_08_125430_create_terms_table', 1),
(9, '2025_09_08_125431_create_subjects_table', 1),
(10, '2025_09_08_125432_create_sections_table', 1),
(11, '2025_09_08_125433_create_section_students_table', 1),
(12, '2025_09_08_125434_create_materials_table', 1),
(13, '2025_09_08_125435_create_assignments_table', 1),
(14, '2025_09_08_125436_create_submissions_table', 1),
(15, '2025_09_08_125437_create_attendances_table', 1),
(16, '2025_09_08_125438_create_attendance_details_table', 1),
(17, '2025_09_08_125439_create_grades_table', 1),
(18, '2025_09_08_125440_create_announcements_table', 1),
(19, '2025_09_08_125441_create_chat_sessions_table', 1),
(20, '2025_09_08_125442_create_chat_messages_table', 1),
(21, '2025_09_08_125443_create_chat_configs_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint UNSIGNED NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(2, 'App\\Models\\User', 3),
(2, 'App\\Models\\User', 4),
(3, 'App\\Models\\User', 5),
(3, 'App\\Models\\User', 6),
(3, 'App\\Models\\User', 7),
(3, 'App\\Models\\User', 8),
(3, 'App\\Models\\User', 11),
(2, 'App\\Models\\User', 12),
(3, 'App\\Models\\User', 14),
(3, 'App\\Models\\User', 15),
(3, 'App\\Models\\User', 16),
(3, 'App\\Models\\User', 17);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint UNSIGNED NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'view-dashboard', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(2, 'manage-master-data', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(3, 'manage-terms', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(4, 'manage-subjects', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(5, 'manage-users', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(6, 'assign-roles', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(7, 'import-users', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(8, 'view-sections', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(9, 'manage-sections', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(10, 'view-section-students', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(11, 'manage-section-students', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(12, 'view-materials', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(13, 'create-materials', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(14, 'edit-materials', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(15, 'delete-materials', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(16, 'view-assignments', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(17, 'create-assignments', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(18, 'edit-assignments', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(19, 'delete-assignments', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(20, 'submit-assignments', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(21, 'view-grades', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(22, 'manage-grades', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(23, 'view-own-grades', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(24, 'view-attendance', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(25, 'manage-attendance', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(26, 'view-own-attendance', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(27, 'view-announcements', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(28, 'create-announcements', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(29, 'edit-announcements', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(30, 'delete-announcements', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(31, 'view-reports', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(32, 'export-reports', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(33, 'use-chatbot', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(34, 'manage-chatbot-config', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(35, 'view-schedule', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(36, 'manage-schedule', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guard_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(2, 'guru', 'web', '2025-09-10 19:23:58', '2025-09-10 19:23:58'),
(3, 'siswa', 'web', '2025-09-10 19:23:59', '2025-09-10 19:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint UNSIGNED NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_has_permissions`
--

INSERT INTO `role_has_permissions` (`permission_id`, `role_id`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(11, 1),
(12, 1),
(13, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(1, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(19, 2),
(21, 2),
(22, 2),
(24, 2),
(25, 2),
(27, 2),
(28, 2),
(29, 2),
(30, 2),
(33, 2),
(35, 2),
(1, 3),
(8, 3),
(10, 3),
(12, 3),
(16, 3),
(20, 3),
(23, 3),
(26, 3),
(27, 3),
(33, 3),
(35, 3);

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` bigint UNSIGNED NOT NULL,
  `subject_id` bigint UNSIGNED NOT NULL,
  `guru_id` bigint UNSIGNED NOT NULL,
  `term_id` bigint UNSIGNED NOT NULL,
  `kapasitas` smallint UNSIGNED DEFAULT NULL,
  `jadwal_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `subject_id`, `guru_id`, `term_id`, `kapasitas`, `jadwal_json`, `created_at`, `updated_at`) VALUES
(1, 1, 12, 1, 30, '[{\"hari\": \"senin\", \"ruangan\": \"R-145\", \"jam_mulai\": \"08:30\", \"jam_selesai\": \"09:30\"}, {\"hari\": \"senin\", \"ruangan\": \"R-144\", \"jam_mulai\": \"12:30\", \"jam_selesai\": \"13:30\"}]', '2025-09-14 12:19:40', '2025-09-14 11:20:00'),
(2, 4, 2, 1, 30, '[{\"hari\": \"senin\", \"ruangan\": \"R-140\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}, {\"hari\": \"senin\", \"ruangan\": \"R-145\", \"jam_mulai\": \"12:30\", \"jam_selesai\": \"13:30\"}]', '2025-09-14 11:29:12', '2025-09-14 11:42:06'),
(3, 5, 3, 1, 20, '[]', '2025-09-15 02:28:40', '2025-09-15 02:28:40'),
(4, 4, 12, 1, 10, '[]', '2025-09-15 05:49:02', '2025-09-15 05:49:02');

-- --------------------------------------------------------

--
-- Table structure for table `section_students`
--

CREATE TABLE `section_students` (
  `id` bigint UNSIGNED NOT NULL,
  `section_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `section_students`
--

INSERT INTO `section_students` (`id`, `section_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, 11, '2025-09-14 12:46:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('iEB36sQArOMQsVF7frsYkFZ1SvCikej5pkne4FAi', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiT0NGdzBldjdsdTlGU1RBTm9WT29NQ2NvY3kyeGtFSzlEZW1xTzlEZyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1757941784),
('xeUChfBpQtriMGwT7WpnEYEMT2IbZ9jivsrwWYrH', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiRUEwcHI4UmhueEhacFlzMnk5MUtzdnAyTVR3cVhnYWtGdm5hbXdCSCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9ndXJ1L2Rhc2hib2FyZCI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjM7fQ==', 1757941734);

-- --------------------------------------------------------

--
-- Table structure for table `siswa_profiles`
--

CREATE TABLE `siswa_profiles` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `nis` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `angkatan` smallint UNSIGNED NOT NULL,
  `kelas` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wali_kelas_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `siswa_profiles`
--

INSERT INTO `siswa_profiles` (`id`, `user_id`, `nis`, `angkatan`, `kelas`, `wali_kelas_id`, `created_at`, `updated_at`) VALUES
(1, 5, '2024001', 2024, 'X-2', NULL, '2025-09-10 19:24:00', '2025-09-14 01:22:00'),
(2, 6, '2024002', 2024, 'X-1', NULL, '2025-09-10 19:24:00', '2025-09-10 19:24:00'),
(3, 7, '2024003', 2024, 'X-2', NULL, '2025-09-10 19:24:01', '2025-09-10 19:24:01'),
(4, 8, '2024004', 2024, 'X-2', NULL, '2025-09-10 19:24:01', '2025-09-10 19:24:01'),
(5, 11, 'SIS000011', 2022, 'X IPA 3', 2, '2025-09-14 01:28:56', '2025-09-14 01:28:56'),
(6, 14, 'SIS001', 2024, 'XII RPL 1', NULL, '2025-09-14 02:54:58', '2025-09-14 02:54:58'),
(7, 15, 'SIS002', 2024, 'XII RPL 1', NULL, '2025-09-14 02:54:59', '2025-09-14 02:54:59'),
(8, 16, 'SIS003', 2024, 'XII RPL 2', NULL, '2025-09-14 02:54:59', '2025-09-14 02:54:59'),
(9, 17, 'SIS004', 2024, 'XII RPL 2', NULL, '2025-09-14 02:54:59', '2025-09-14 02:54:59');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint UNSIGNED NOT NULL,
  `kode` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `kode`, `nama`, `deskripsi`, `created_at`, `updated_at`) VALUES
(1, 'MTK', 'Matematika', 'Mata pelajaran Matematika', '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(2, 'IPA', 'Ilmu Pengetahuan Alam', 'Mata pelajaran IPA', '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(3, 'IPS', 'Ilmu Pengetahuan Sosial', 'Mata pelajaran IPS', '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(4, 'BIN', 'Bahasa Indonesia', 'Mata pelajaran Bahasa Indonesia', '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(5, 'ENG', 'Bahasa Inggris', 'Mata pelajaran Bahasa Inggris', '2025-09-10 19:23:59', '2025-09-10 19:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` bigint UNSIGNED NOT NULL,
  `assignment_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `konten_teks` longtext COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` datetime NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `terms`
--

CREATE TABLE `terms` (
  `id` bigint UNSIGNED NOT NULL,
  `tahun` varchar(9) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` enum('ganjil','genap') COLLATE utf8mb4_unicode_ci NOT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `terms`
--

INSERT INTO `terms` (`id`, `tahun`, `semester`, `aktif`, `created_at`, `updated_at`) VALUES
(1, '2024/2025', 'ganjil', 1, '2025-09-10 19:23:59', '2025-09-10 19:23:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin@sims.com', '2025-09-10 19:23:59', '$2y$12$nb2TCC34TW1B7xHZwYzoeuuZ8bL0mTqtNITLaeyJGnm/UHX9hf.xy', NULL, '2025-09-10 19:23:59', '2025-09-11 19:31:16'),
(2, 'Budi Santoso', 'budi.guru@sims.com', '2025-09-10 19:23:59', '$2y$12$9O9EpB8aw1mxMWkx69b2mOUczBvlGK5.WaIBka3QOay3mIymeCJwK', NULL, '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(3, 'Siti Nurhaliza', 'siti.guru@sims.com', '2025-09-10 19:23:59', '$2y$12$.fZ/pfAAqmtiL6zl0hF.l.Wboglshw9/v00xH/vABPuYcG3l.Tg32', NULL, '2025-09-10 19:23:59', '2025-09-10 19:23:59'),
(4, 'Ahmad Wijaya', 'ahmad.guru@sims.com', '2025-09-10 19:24:00', '$2y$12$mbq806LUEvYnUun4Z/mSwuBQrNyqtb.IbjHnXIw/GHTAp8RIz6X.6', NULL, '2025-09-10 19:24:00', '2025-09-10 19:24:00'),
(5, 'Andi Pratama Siregar', 'andi.siswa@sims.com', '2025-09-10 19:24:00', '$2y$12$4w0jaj4si/SO3vSOTtPH..xCMlyvTU9kzTQsFpo7RrxXLnZY7Ygem', NULL, '2025-09-10 19:24:00', '2025-09-14 01:16:05'),
(6, 'Dewi Sartika', 'dewi.siswa@sims.com', '2025-09-10 19:24:00', '$2y$12$vtcIRNnmtivuQcXUrEDnrOuH306ZNoKuN5Wzuawz8Oy9opbJxRIPy', NULL, '2025-09-10 19:24:00', '2025-09-10 19:24:00'),
(7, 'Rudi Hermawan', 'rudi.siswa@sims.com', '2025-09-10 19:24:01', '$2y$12$gl5YBBp6WQ7wJxd.5TfHneiKOPLhvvYTPdD4vJjjGo70KJ6foTj1i', NULL, '2025-09-10 19:24:01', '2025-09-10 19:24:01'),
(8, 'Maya Sari', 'maya.siswa@sims.com', '2025-09-10 19:24:01', '$2y$12$9E7MD5fZw4xmYn4dX.37seIE6O6dHTDVVP/TSRN4BsJee3UuMlqPC', NULL, '2025-09-10 19:24:01', '2025-09-10 19:24:01'),
(11, 'Bintangin', 'bintang.siswa@sims.com', '2025-09-14 08:37:43', '$2y$12$/JvzBW5A.9L2RALiVzbBn.3aU3Byii.0Sf8cQTc3AlzEs9jRvUss6', NULL, '2025-09-14 01:28:56', '2025-09-14 01:28:56'),
(12, 'Bintanginn', 'bintang.guru@sims.com', '2025-09-14 02:42:10', '$2y$12$YoUitobHOfUik38htEKhWer/oXwuGW05zluqhg39/zDCbX20Xqrb2', NULL, '2025-09-14 01:32:38', '2025-09-14 02:42:10'),
(14, 'Ahmad Fauzi', 'ahmad.fauzi@student.com', '2025-09-14 02:54:58', '$2y$12$aTz/afUIGBvuQhk.rToF/.NvOmyDi4gY.WrJq10knyCZSnE/.Zf1y', NULL, '2025-09-14 02:54:58', '2025-09-14 02:54:58'),
(15, 'Siti Nurhaliza', 'siti.nurhaliza@student.com', '2025-09-14 02:54:59', '$2y$12$wQ.qD4jFR9czweKZ2I6LVOtyIKV/m2B/Dm/S162B4WgoRuk6zbLee', NULL, '2025-09-14 02:54:59', '2025-09-14 02:54:59'),
(16, 'Budi Santoso', 'budi.santoso@student.com', '2025-09-14 02:54:59', '$2y$12$ZGHUMV/UAwS8MnyUyLOMduXtBqkuI0vwfjjidSca/4diMhWsYtVje', NULL, '2025-09-14 02:54:59', '2025-09-14 02:54:59'),
(17, 'Dewi Sartika', 'dewi.sartika@student.com', '2025-09-14 02:54:59', '$2y$12$WVTTTQxZN8cKf9kSyYMjGeCg.Edj2a7KFWvfL.WoxFuPRxZcQR1Eu', NULL, '2025-09-14 02:54:59', '2025-09-14 02:54:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcements_created_by_foreign` (`created_by`),
  ADD KEY `announcements_scope_type_scope_id_index` (`scope_type`,`scope_id`),
  ADD KEY `announcements_role_name_index` (`role_name`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignments_section_id_deadline_index` (`section_id`,`deadline`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendances_section_id_pertemuan_ke_unique` (`section_id`,`pertemuan_ke`);

--
-- Indexes for table `attendance_details`
--
ALTER TABLE `attendance_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `attendance_details_attendance_id_user_id_unique` (`attendance_id`,`user_id`),
  ADD KEY `attendance_details_user_id_foreign` (`user_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `chat_configs`
--
ALTER TABLE `chat_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chat_configs_key_unique` (`key`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_messages_session_id_index` (`session_id`);

--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chat_sessions_user_id_source_index` (`user_id`,`source`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grades_section_id_user_id_komponen_unique` (`section_id`,`user_id`,`komponen`),
  ADD KEY `grades_user_id_foreign` (`user_id`);

--
-- Indexes for table `guru_profiles`
--
ALTER TABLE `guru_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `guru_profiles_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `guru_profiles_nidn_unique` (`nidn`),
  ADD UNIQUE KEY `guru_profiles_nuptk_unique` (`nuptk`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materials_section_id_foreign` (`section_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indexes for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sections_term_id_foreign` (`term_id`),
  ADD KEY `sections_subject_id_term_id_index` (`subject_id`,`term_id`),
  ADD KEY `sections_guru_id_term_id_index` (`guru_id`,`term_id`);

--
-- Indexes for table `section_students`
--
ALTER TABLE `section_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_students_section_id_user_id_unique` (`section_id`,`user_id`),
  ADD KEY `section_students_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `siswa_profiles`
--
ALTER TABLE `siswa_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `siswa_profiles_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `siswa_profiles_nis_unique` (`nis`),
  ADD KEY `siswa_profiles_wali_kelas_id_foreign` (`wali_kelas_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subjects_kode_unique` (`kode`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `submissions_assignment_id_user_id_unique` (`assignment_id`,`user_id`),
  ADD KEY `submissions_user_id_submitted_at_index` (`user_id`,`submitted_at`);

--
-- Indexes for table `terms`
--
ALTER TABLE `terms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `terms_tahun_semester_unique` (`tahun`,`semester`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_details`
--
ALTER TABLE `attendance_details`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_configs`
--
ALTER TABLE `chat_configs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guru_profiles`
--
ALTER TABLE `guru_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `section_students`
--
ALTER TABLE `section_students`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `siswa_profiles`
--
ALTER TABLE `siswa_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `terms`
--
ALTER TABLE `terms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance_details`
--
ALTER TABLE `attendance_details`
  ADD CONSTRAINT `attendance_details_attendance_id_foreign` FOREIGN KEY (`attendance_id`) REFERENCES `attendances` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_session_id_foreign` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD CONSTRAINT `chat_sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guru_profiles`
--
ALTER TABLE `guru_profiles`
  ADD CONSTRAINT `guru_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `materials_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_guru_id_foreign` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sections_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sections_term_id_foreign` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `section_students`
--
ALTER TABLE `section_students`
  ADD CONSTRAINT `section_students_section_id_foreign` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `section_students_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `siswa_profiles`
--
ALTER TABLE `siswa_profiles`
  ADD CONSTRAINT `siswa_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `siswa_profiles_wali_kelas_id_foreign` FOREIGN KEY (`wali_kelas_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
