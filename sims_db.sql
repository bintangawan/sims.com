-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 25, 2025 at 05:21 PM
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
(7, 'Pemberitahuan Pemeliharaan Sistem SIMS', 'Kepada seluruh pengguna SIMS,\nDiberitahukan bahwa sistem akan menjalani proses pemeliharaan rutin pada:\nTanggal: Sabtu, 28 September 2025\nWaktu: 21.00 – 23.00 WIB\n\nSelama periode tersebut, sistem tidak dapat diakses sementara. Mohon untuk menyelesaikan seluruh aktivitas sebelum waktu yang telah ditentukan.\nTerima kasih atas pengertian dan kerja samanya.', 'global', NULL, NULL, '2025-09-22 23:40:04', 1, '2025-09-22 23:40:04', '2025-09-22 23:40:04'),
(8, 'Batas Pengumpulan Nilai Akhir Semester Ganjil', 'Kepada Bapak/Ibu Guru,\nDiharapkan untuk segera mengunggah nilai akhir semester ganjil melalui SIMS sebelum:\nTanggal: 5 Oktober 2025\nWaktu: 23.59 WIB\n\nKeterlambatan pengunggahan dapat memengaruhi proses rekapitulasi nilai dan penerbitan rapor siswa. Jika ada kendala teknis, silakan hubungi admin sistem.', 'role', NULL, 'guru', '2025-09-22 23:41:03', 1, '2025-09-22 23:41:03', '2025-09-22 23:41:03'),
(9, 'Jadwal Ujian Tengah Semester (UTS) Ganjil 2025', 'Halo para siswa,\nBerikut adalah jadwal Ujian Tengah Semester (UTS) Ganjil Tahun Ajaran 2025/2026:\n\nSenin, 6 Oktober 2025: Matematika & Bahasa Indonesia\n\nSelasa, 7 Oktober 2025: IPA & Bahasa Inggris\n\nRabu, 8 Oktober 2025: IPS & PKN\n\nMohon dipersiapkan dengan baik seluruh materi yang telah dipelajari. Jangan lupa membawa kartu ujian yang dapat dicetak melalui menu Dashboard Siswa di SIMS.', 'role', NULL, 'siswa', '2025-09-22 23:42:25', 1, '2025-09-22 23:42:25', '2025-09-22 23:42:25');

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

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `section_id`, `judul`, `deskripsi`, `tipe`, `deadline`, `rubrik_json`, `published_at`, `created_at`, `updated_at`) VALUES
(4, 1, 'Menulis Cerpen Bahasa Indonesia', 'Buat cerpen dengan tema bebas namun mengandung pesan moral positif. Panjang cerpen 2–3 halaman A4. File dikumpulkan dalam format DOCX atau PDF.', 'file', '2025-09-25 15:00:00', '[]', '2025-09-23 00:16:39', '2025-09-23 00:16:40', '2025-09-23 00:16:40');

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

--
-- Dumping data for table `attendances`
--

INSERT INTO `attendances` (`id`, `section_id`, `pertemuan_ke`, `tanggal`, `created_at`, `updated_at`) VALUES
(4, 1, 1, '2025-09-23', '2025-09-23 00:19:15', '2025-09-23 00:19:15');

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

--
-- Dumping data for table `attendance_details`
--

INSERT INTO `attendance_details` (`id`, `attendance_id`, `user_id`, `status`, `note`, `created_at`, `updated_at`) VALUES
(8, 4, 12, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(9, 4, 13, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(10, 4, 14, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(11, 4, 15, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(12, 4, 16, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(13, 4, 17, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(14, 4, 18, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(15, 4, 19, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(16, 4, 20, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15'),
(17, 4, 21, 'hadir', NULL, '2025-09-23 00:19:15', '2025-09-23 00:19:15');

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
('laravel_cache_356a192b7913b04c54574d18c28d46e6395428ab', 'i:1;', 1758561730),
('laravel_cache_356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1758561730;', 1758561730),
('laravel_cache_5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1758620051),
('laravel_cache_5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1758620051;', 1758620051),
('laravel_cache_andi.guru@sims.com|127.0.0.1', 'i:1;', 1758563187),
('laravel_cache_andi.guru@sims.com|127.0.0.1:timer', 'i:1758563187;', 1758563187),
('laravel_cache_bintang.guru@siswa.com|127.0.0.1', 'i:1;', 1758174973),
('laravel_cache_bintang.guru@siswa.com|127.0.0.1:timer', 'i:1758174973;', 1758174973),
('laravel_cache_spatie.permission.cache', 'a:3:{s:5:\"alias\";a:4:{s:1:\"a\";s:2:\"id\";s:1:\"b\";s:4:\"name\";s:1:\"c\";s:10:\"guard_name\";s:1:\"r\";s:5:\"roles\";}s:11:\"permissions\";a:36:{i:0;a:4:{s:1:\"a\";i:1;s:1:\"b\";s:14:\"view-dashboard\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:1;a:4:{s:1:\"a\";i:2;s:1:\"b\";s:18:\"manage-master-data\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:2;a:4:{s:1:\"a\";i:3;s:1:\"b\";s:12:\"manage-terms\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:3;a:4:{s:1:\"a\";i:4;s:1:\"b\";s:15:\"manage-subjects\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:4;a:4:{s:1:\"a\";i:5;s:1:\"b\";s:12:\"manage-users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:5;a:4:{s:1:\"a\";i:6;s:1:\"b\";s:12:\"assign-roles\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:6;a:4:{s:1:\"a\";i:7;s:1:\"b\";s:12:\"import-users\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:7;a:4:{s:1:\"a\";i:8;s:1:\"b\";s:13:\"view-sections\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:8;a:4:{s:1:\"a\";i:9;s:1:\"b\";s:15:\"manage-sections\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:9;a:4:{s:1:\"a\";i:10;s:1:\"b\";s:21:\"view-section-students\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:10;a:4:{s:1:\"a\";i:11;s:1:\"b\";s:23:\"manage-section-students\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:11;a:4:{s:1:\"a\";i:12;s:1:\"b\";s:14:\"view-materials\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:12;a:4:{s:1:\"a\";i:13;s:1:\"b\";s:16:\"create-materials\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:13;a:4:{s:1:\"a\";i:14;s:1:\"b\";s:14:\"edit-materials\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:14;a:4:{s:1:\"a\";i:15;s:1:\"b\";s:16:\"delete-materials\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:15;a:4:{s:1:\"a\";i:16;s:1:\"b\";s:16:\"view-assignments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:16;a:4:{s:1:\"a\";i:17;s:1:\"b\";s:18:\"create-assignments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:17;a:4:{s:1:\"a\";i:18;s:1:\"b\";s:16:\"edit-assignments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:18;a:4:{s:1:\"a\";i:19;s:1:\"b\";s:18:\"delete-assignments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:19;a:4:{s:1:\"a\";i:20;s:1:\"b\";s:18:\"submit-assignments\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:20;a:4:{s:1:\"a\";i:21;s:1:\"b\";s:11:\"view-grades\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:21;a:4:{s:1:\"a\";i:22;s:1:\"b\";s:13:\"manage-grades\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:22;a:4:{s:1:\"a\";i:23;s:1:\"b\";s:15:\"view-own-grades\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:23;a:4:{s:1:\"a\";i:24;s:1:\"b\";s:15:\"view-attendance\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:24;a:4:{s:1:\"a\";i:25;s:1:\"b\";s:17:\"manage-attendance\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:25;a:4:{s:1:\"a\";i:26;s:1:\"b\";s:19:\"view-own-attendance\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:3;}}i:26;a:4:{s:1:\"a\";i:27;s:1:\"b\";s:18:\"view-announcements\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:27;a:4:{s:1:\"a\";i:28;s:1:\"b\";s:20:\"create-announcements\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:28;a:4:{s:1:\"a\";i:29;s:1:\"b\";s:18:\"edit-announcements\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:29;a:4:{s:1:\"a\";i:30;s:1:\"b\";s:20:\"delete-announcements\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:2:{i:0;i:1;i:1;i:2;}}i:30;a:4:{s:1:\"a\";i:31;s:1:\"b\";s:12:\"view-reports\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:31;a:4:{s:1:\"a\";i:32;s:1:\"b\";s:14:\"export-reports\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:32;a:4:{s:1:\"a\";i:33;s:1:\"b\";s:11:\"use-chatbot\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:33;a:4:{s:1:\"a\";i:34;s:1:\"b\";s:21:\"manage-chatbot-config\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}i:34;a:4:{s:1:\"a\";i:35;s:1:\"b\";s:13:\"view-schedule\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}i:35;a:4:{s:1:\"a\";i:36;s:1:\"b\";s:15:\"manage-schedule\";s:1:\"c\";s:3:\"web\";s:1:\"r\";a:1:{i:0;i:1;}}}s:5:\"roles\";a:3:{i:0;a:3:{s:1:\"a\";i:1;s:1:\"b\";s:5:\"admin\";s:1:\"c\";s:3:\"web\";}i:1;a:3:{s:1:\"a\";i:2;s:1:\"b\";s:4:\"guru\";s:1:\"c\";s:3:\"web\";}i:2;a:3:{s:1:\"a\";i:3;s:1:\"b\";s:5:\"siswa\";s:1:\"c\";s:3:\"web\";}}}', 1758776775);

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

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `session_id`, `sender`, `content`, `meta_json`, `created_at`, `updated_at`) VALUES
(1, 1, 'user', 'Ada pengumuman minggu ini?', NULL, '2025-09-23 01:50:27', '2025-09-23 01:50:27'),
(2, 2, 'user', 'Ada pengumuman minggu ini?', NULL, '2025-09-23 01:55:30', '2025-09-23 01:55:30'),
(3, 3, 'user', 'Ada pengumuman minggu ini?', NULL, '2025-09-23 01:57:21', '2025-09-23 01:57:21'),
(4, 4, 'user', 'Ada pengumuman minggu ini?', NULL, '2025-09-23 02:10:23', '2025-09-23 02:10:23'),
(5, 5, 'user', 'nk', NULL, '2025-09-23 02:15:40', '2025-09-23 02:15:40'),
(6, 6, 'user', 'Ada pengumuman minggu ini?', NULL, '2025-09-23 02:17:09', '2025-09-23 02:17:09'),
(7, 7, 'user', 'sdsd', NULL, '2025-09-23 02:17:31', '2025-09-23 02:17:31'),
(8, 8, 'user', 'hallow', NULL, '2025-09-23 02:19:27', '2025-09-23 02:19:27'),
(9, 9, 'user', 'Bagaimana cara reset password?', NULL, '2025-09-23 02:33:11', '2025-09-23 02:33:11');

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

--
-- Dumping data for table `chat_sessions`
--

INSERT INTO `chat_sessions` (`id`, `user_id`, `role`, `source`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'landing', '2025-09-23 01:50:27', '2025-09-23 01:50:27'),
(2, NULL, NULL, 'landing', '2025-09-23 01:55:30', '2025-09-23 01:55:30'),
(3, NULL, NULL, 'landing', '2025-09-23 01:57:21', '2025-09-23 01:57:21'),
(4, NULL, NULL, 'landing', '2025-09-23 02:10:23', '2025-09-23 02:10:23'),
(5, NULL, NULL, 'guru', '2025-09-23 02:15:40', '2025-09-23 02:15:40'),
(6, NULL, NULL, 'landing', '2025-09-23 02:17:09', '2025-09-23 02:17:09'),
(7, NULL, NULL, 'guru', '2025-09-23 02:17:31', '2025-09-23 02:17:31'),
(8, NULL, NULL, 'guru', '2025-09-23 02:19:27', '2025-09-23 02:19:27'),
(9, NULL, NULL, 'admin', '2025-09-23 02:33:11', '2025-09-23 02:33:11');

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
(8, 2, '1234567891', '9876543211', 'Bahasa Indonesia', '081234567891', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(9, 3, '1234567892', '9876543212', 'Bahasa Inggris', '081234567892', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(10, 4, '1234567893', '9876543213', 'Fisika', '081234567893', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(11, 5, '1234567894', '9876543214', 'Kimia', '081234567894', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(12, 6, '1234567895', '9876543215', 'Biologi', '081234567895', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(13, 7, '1234567896', '9876543216', 'Sejarah', '081234567896', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(14, 8, '1234567897', '9876543217', 'Geografi', '081234567897', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(15, 9, '1234567898', '9876543218', 'Ekonomi', '081234567898', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(16, 10, '1234567899', '9876543219', 'Seni Budaya', '081234567899', '2025-09-22 17:15:57', '2025-09-22 17:15:57'),
(17, 11, '1234567819', '9876543105', 'Pemrograman Web', '087766554433', '2025-09-22 17:47:00', '2025-09-22 17:47:00');

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
(2, 'App\\Models\\User', 5),
(2, 'App\\Models\\User', 6),
(2, 'App\\Models\\User', 7),
(2, 'App\\Models\\User', 8),
(2, 'App\\Models\\User', 9),
(2, 'App\\Models\\User', 10),
(2, 'App\\Models\\User', 11),
(3, 'App\\Models\\User', 12),
(3, 'App\\Models\\User', 13),
(3, 'App\\Models\\User', 14),
(3, 'App\\Models\\User', 15),
(3, 'App\\Models\\User', 16),
(3, 'App\\Models\\User', 17),
(3, 'App\\Models\\User', 18),
(3, 'App\\Models\\User', 19),
(3, 'App\\Models\\User', 20),
(3, 'App\\Models\\User', 21),
(3, 'App\\Models\\User', 22),
(3, 'App\\Models\\User', 23),
(3, 'App\\Models\\User', 24),
(3, 'App\\Models\\User', 25),
(3, 'App\\Models\\User', 26),
(3, 'App\\Models\\User', 27),
(3, 'App\\Models\\User', 28),
(3, 'App\\Models\\User', 29),
(3, 'App\\Models\\User', 30),
(3, 'App\\Models\\User', 31),
(3, 'App\\Models\\User', 32),
(3, 'App\\Models\\User', 33),
(3, 'App\\Models\\User', 34),
(3, 'App\\Models\\User', 35),
(3, 'App\\Models\\User', 36),
(3, 'App\\Models\\User', 37),
(3, 'App\\Models\\User', 38),
(3, 'App\\Models\\User', 39),
(3, 'App\\Models\\User', 40),
(3, 'App\\Models\\User', 41),
(3, 'App\\Models\\User', 42),
(3, 'App\\Models\\User', 43),
(3, 'App\\Models\\User', 44),
(3, 'App\\Models\\User', 45),
(3, 'App\\Models\\User', 46),
(3, 'App\\Models\\User', 47),
(3, 'App\\Models\\User', 48),
(3, 'App\\Models\\User', 49),
(3, 'App\\Models\\User', 50),
(3, 'App\\Models\\User', 51),
(3, 'App\\Models\\User', 52),
(3, 'App\\Models\\User', 53),
(3, 'App\\Models\\User', 54),
(3, 'App\\Models\\User', 55),
(3, 'App\\Models\\User', 56),
(3, 'App\\Models\\User', 57),
(3, 'App\\Models\\User', 58),
(3, 'App\\Models\\User', 59),
(3, 'App\\Models\\User', 60),
(3, 'App\\Models\\User', 61),
(3, 'App\\Models\\User', 62),
(3, 'App\\Models\\User', 63),
(3, 'App\\Models\\User', 64),
(3, 'App\\Models\\User', 65),
(3, 'App\\Models\\User', 66),
(3, 'App\\Models\\User', 67),
(3, 'App\\Models\\User', 68),
(3, 'App\\Models\\User', 69),
(3, 'App\\Models\\User', 70),
(3, 'App\\Models\\User', 71),
(3, 'App\\Models\\User', 72),
(3, 'App\\Models\\User', 73),
(3, 'App\\Models\\User', 74),
(3, 'App\\Models\\User', 75),
(3, 'App\\Models\\User', 76),
(3, 'App\\Models\\User', 77),
(3, 'App\\Models\\User', 78),
(3, 'App\\Models\\User', 79),
(3, 'App\\Models\\User', 80),
(3, 'App\\Models\\User', 81),
(3, 'App\\Models\\User', 82),
(3, 'App\\Models\\User', 83),
(3, 'App\\Models\\User', 84),
(3, 'App\\Models\\User', 85),
(3, 'App\\Models\\User', 86),
(3, 'App\\Models\\User', 87),
(3, 'App\\Models\\User', 88),
(3, 'App\\Models\\User', 89),
(3, 'App\\Models\\User', 90),
(3, 'App\\Models\\User', 91),
(3, 'App\\Models\\User', 92),
(3, 'App\\Models\\User', 93),
(3, 'App\\Models\\User', 94),
(3, 'App\\Models\\User', 95),
(3, 'App\\Models\\User', 96),
(3, 'App\\Models\\User', 97),
(3, 'App\\Models\\User', 98),
(3, 'App\\Models\\User', 99),
(3, 'App\\Models\\User', 100),
(3, 'App\\Models\\User', 101),
(3, 'App\\Models\\User', 102),
(3, 'App\\Models\\User', 103),
(3, 'App\\Models\\User', 104),
(3, 'App\\Models\\User', 105),
(3, 'App\\Models\\User', 106),
(3, 'App\\Models\\User', 107),
(3, 'App\\Models\\User', 108),
(3, 'App\\Models\\User', 109),
(3, 'App\\Models\\User', 110),
(3, 'App\\Models\\User', 111),
(3, 'App\\Models\\User', 112),
(3, 'App\\Models\\User', 113),
(3, 'App\\Models\\User', 114);

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
(1, 1, 2, 1, 30, '[{\"hari\": \"senin\", \"ruangan\": \"R-101\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(2, 2, 3, 1, 28, '[{\"hari\": \"selasa\", \"ruangan\": \"R-102\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(3, 3, 4, 1, 32, '[{\"hari\": \"rabu\", \"ruangan\": \"R-103\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(4, 4, 5, 1, 26, '[{\"hari\": \"kamis\", \"ruangan\": \"R-104\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(5, 5, 6, 1, 35, '[{\"hari\": \"jumat\", \"ruangan\": \"R-105\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(6, 6, 7, 1, 40, '[{\"hari\": \"senin\", \"ruangan\": \"R-106\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(7, 7, 8, 1, 30, '[{\"hari\": \"selasa\", \"ruangan\": \"R-107\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(8, 8, 9, 1, 28, '[{\"hari\": \"rabu\", \"ruangan\": \"R-108\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(9, 9, 10, 1, 32, '[{\"hari\": \"kamis\", \"ruangan\": \"R-109\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(10, 10, 11, 1, 26, '[{\"hari\": \"jumat\", \"ruangan\": \"R-110\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(11, 11, 2, 1, 35, '[{\"hari\": \"senin\", \"ruangan\": \"R-111\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(12, 12, 3, 1, 40, '[{\"hari\": \"selasa\", \"ruangan\": \"R-112\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(13, 13, 4, 1, 30, '[{\"hari\": \"rabu\", \"ruangan\": \"R-113\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(14, 14, 5, 1, 28, '[{\"hari\": \"kamis\", \"ruangan\": \"R-114\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(15, 15, 6, 1, 32, '[{\"hari\": \"jumat\", \"ruangan\": \"R-115\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(16, 16, 7, 1, 26, '[{\"hari\": \"senin\", \"ruangan\": \"R-116\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(17, 17, 8, 1, 35, '[{\"hari\": \"selasa\", \"ruangan\": \"R-117\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(18, 18, 9, 1, 40, '[{\"hari\": \"rabu\", \"ruangan\": \"R-118\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(19, 19, 10, 1, 30, '[{\"hari\": \"kamis\", \"ruangan\": \"R-119\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(20, 20, 11, 1, 28, '[{\"hari\": \"jumat\", \"ruangan\": \"R-120\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(21, 21, 2, 1, 32, '[{\"hari\": \"senin\", \"ruangan\": \"R-121\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(22, 22, 3, 1, 26, '[{\"hari\": \"selasa\", \"ruangan\": \"R-122\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(23, 23, 4, 1, 35, '[{\"hari\": \"rabu\", \"ruangan\": \"R-123\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(24, 24, 5, 1, 40, '[{\"hari\": \"kamis\", \"ruangan\": \"R-124\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(25, 25, 6, 1, 30, '[{\"hari\": \"jumat\", \"ruangan\": \"R-125\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(26, 26, 7, 1, 28, '[{\"hari\": \"senin\", \"ruangan\": \"R-126\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(27, 27, 8, 1, 32, '[{\"hari\": \"selasa\", \"ruangan\": \"R-127\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(28, 28, 9, 1, 26, '[{\"hari\": \"rabu\", \"ruangan\": \"R-128\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(29, 29, 10, 1, 35, '[{\"hari\": \"kamis\", \"ruangan\": \"R-129\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(30, 30, 11, 1, 40, '[{\"hari\": \"jumat\", \"ruangan\": \"R-130\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(31, 31, 2, 1, 30, '[{\"hari\": \"senin\", \"ruangan\": \"R-131\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(32, 32, 3, 1, 28, '[{\"hari\": \"selasa\", \"ruangan\": \"R-132\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(33, 33, 4, 1, 32, '[{\"hari\": \"rabu\", \"ruangan\": \"R-133\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(34, 34, 5, 1, 26, '[{\"hari\": \"kamis\", \"ruangan\": \"R-134\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(35, 35, 6, 1, 35, '[{\"hari\": \"jumat\", \"ruangan\": \"R-135\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(36, 36, 7, 1, 40, '[{\"hari\": \"senin\", \"ruangan\": \"R-136\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(37, 37, 8, 1, 30, '[{\"hari\": \"selasa\", \"ruangan\": \"R-137\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(38, 38, 9, 1, 28, '[{\"hari\": \"rabu\", \"ruangan\": \"R-138\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(39, 39, 10, 1, 32, '[{\"hari\": \"kamis\", \"ruangan\": \"R-139\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(40, 40, 11, 1, 26, '[{\"hari\": \"jumat\", \"ruangan\": \"R-140\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(41, 41, 2, 1, 35, '[{\"hari\": \"senin\", \"ruangan\": \"R-141\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(42, 42, 3, 1, 40, '[{\"hari\": \"selasa\", \"ruangan\": \"R-142\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(43, 43, 4, 1, 30, '[{\"hari\": \"rabu\", \"ruangan\": \"R-143\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(44, 44, 5, 1, 28, '[{\"hari\": \"kamis\", \"ruangan\": \"R-144\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(45, 45, 6, 1, 32, '[{\"hari\": \"jumat\", \"ruangan\": \"R-145\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(46, 46, 7, 1, 26, '[{\"hari\": \"senin\", \"ruangan\": \"R-146\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(47, 47, 8, 1, 35, '[{\"hari\": \"selasa\", \"ruangan\": \"R-147\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(48, 48, 9, 1, 40, '[{\"hari\": \"rabu\", \"ruangan\": \"R-148\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(49, 49, 10, 1, 30, '[{\"hari\": \"kamis\", \"ruangan\": \"R-149\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(50, 50, 11, 1, 28, '[{\"hari\": \"jumat\", \"ruangan\": \"R-150\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(51, 51, 2, 1, 32, '[{\"hari\": \"senin\", \"ruangan\": \"R-151\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(52, 52, 3, 1, 26, '[{\"hari\": \"selasa\", \"ruangan\": \"R-152\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(53, 53, 4, 1, 35, '[{\"hari\": \"rabu\", \"ruangan\": \"R-153\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(54, 54, 5, 1, 40, '[{\"hari\": \"kamis\", \"ruangan\": \"R-154\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(55, 55, 6, 1, 30, '[{\"hari\": \"jumat\", \"ruangan\": \"R-155\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(56, 56, 7, 1, 28, '[{\"hari\": \"senin\", \"ruangan\": \"R-156\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(57, 57, 8, 1, 32, '[{\"hari\": \"selasa\", \"ruangan\": \"R-157\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(58, 58, 9, 1, 26, '[{\"hari\": \"rabu\", \"ruangan\": \"R-158\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(59, 59, 10, 1, 35, '[{\"hari\": \"kamis\", \"ruangan\": \"R-159\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(60, 60, 11, 1, 40, '[{\"hari\": \"jumat\", \"ruangan\": \"R-160\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(61, 61, 2, 1, 30, '[{\"hari\": \"senin\", \"ruangan\": \"R-161\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(62, 62, 3, 1, 28, '[{\"hari\": \"selasa\", \"ruangan\": \"R-162\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(63, 63, 4, 1, 32, '[{\"hari\": \"rabu\", \"ruangan\": \"R-163\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(64, 64, 5, 1, 26, '[{\"hari\": \"kamis\", \"ruangan\": \"R-164\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(65, 65, 6, 1, 35, '[{\"hari\": \"jumat\", \"ruangan\": \"R-165\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(66, 66, 7, 1, 40, '[{\"hari\": \"senin\", \"ruangan\": \"R-166\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(67, 67, 8, 1, 30, '[{\"hari\": \"selasa\", \"ruangan\": \"R-167\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(68, 68, 9, 1, 28, '[{\"hari\": \"rabu\", \"ruangan\": \"R-168\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(69, 69, 10, 1, 32, '[{\"hari\": \"kamis\", \"ruangan\": \"R-169\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(70, 70, 11, 1, 26, '[{\"hari\": \"jumat\", \"ruangan\": \"R-170\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(71, 71, 2, 1, 35, '[{\"hari\": \"senin\", \"ruangan\": \"R-171\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(72, 72, 3, 1, 40, '[{\"hari\": \"selasa\", \"ruangan\": \"R-172\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(73, 73, 4, 1, 30, '[{\"hari\": \"rabu\", \"ruangan\": \"R-173\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(74, 74, 5, 1, 28, '[{\"hari\": \"kamis\", \"ruangan\": \"R-174\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(75, 75, 6, 1, 32, '[{\"hari\": \"jumat\", \"ruangan\": \"R-175\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(76, 76, 7, 1, 26, '[{\"hari\": \"senin\", \"ruangan\": \"R-176\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(77, 77, 8, 1, 35, '[{\"hari\": \"selasa\", \"ruangan\": \"R-177\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(78, 78, 9, 1, 40, '[{\"hari\": \"rabu\", \"ruangan\": \"R-178\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(79, 79, 10, 1, 30, '[{\"hari\": \"kamis\", \"ruangan\": \"R-179\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(80, 80, 11, 1, 28, '[{\"hari\": \"jumat\", \"ruangan\": \"R-180\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(81, 81, 2, 1, 32, '[{\"hari\": \"senin\", \"ruangan\": \"R-181\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(82, 82, 3, 1, 26, '[{\"hari\": \"selasa\", \"ruangan\": \"R-182\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(83, 83, 4, 1, 35, '[{\"hari\": \"rabu\", \"ruangan\": \"R-183\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(84, 84, 5, 1, 40, '[{\"hari\": \"kamis\", \"ruangan\": \"R-184\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(85, 85, 6, 1, 30, '[{\"hari\": \"jumat\", \"ruangan\": \"R-185\", \"jam_mulai\": \"08:00\", \"jam_selesai\": \"09:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(86, 86, 7, 1, 28, '[{\"hari\": \"senin\", \"ruangan\": \"R-186\", \"jam_mulai\": \"09:15\", \"jam_selesai\": \"10:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(87, 87, 8, 1, 32, '[{\"hari\": \"selasa\", \"ruangan\": \"R-187\", \"jam_mulai\": \"10:30\", \"jam_selesai\": \"11:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(88, 88, 9, 1, 26, '[{\"hari\": \"rabu\", \"ruangan\": \"R-188\", \"jam_mulai\": \"13:00\", \"jam_selesai\": \"14:00\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(89, 89, 10, 1, 35, '[{\"hari\": \"kamis\", \"ruangan\": \"R-189\", \"jam_mulai\": \"14:15\", \"jam_selesai\": \"15:15\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25'),
(90, 90, 11, 1, 40, '[{\"hari\": \"jumat\", \"ruangan\": \"R-190\", \"jam_mulai\": \"15:30\", \"jam_selesai\": \"16:30\"}]', '2025-09-23 04:37:25', '2025-09-23 04:37:25');

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
(1, 2, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(2, 2, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(3, 2, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(4, 2, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(5, 2, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(6, 2, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(7, 2, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(8, 2, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(9, 2, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(10, 2, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(11, 12, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(12, 12, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(13, 12, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(14, 12, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(15, 12, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(16, 12, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(17, 12, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(18, 12, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(19, 12, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(20, 12, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(21, 22, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(22, 22, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(23, 22, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(24, 22, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(25, 22, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(26, 22, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(27, 22, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(28, 22, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(29, 22, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(30, 22, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(31, 32, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(32, 32, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(33, 32, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(34, 32, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(35, 32, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(36, 32, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(37, 32, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(38, 32, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(39, 32, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(40, 32, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(41, 42, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(42, 42, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(43, 42, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(44, 42, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(45, 42, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(46, 42, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(47, 42, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(48, 42, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(49, 42, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(50, 42, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(51, 52, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(52, 52, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(53, 52, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(54, 52, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(55, 52, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(56, 52, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(57, 52, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(58, 52, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(59, 52, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(60, 52, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(61, 62, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(62, 62, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(63, 62, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(64, 62, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(65, 62, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(66, 62, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(67, 62, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(68, 62, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(69, 62, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(70, 62, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(71, 72, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(72, 72, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(73, 72, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(74, 72, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(75, 72, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(76, 72, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(77, 72, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(78, 72, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(79, 72, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(80, 72, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(81, 82, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(82, 82, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(83, 82, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(84, 82, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(85, 82, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(86, 82, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(87, 82, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(88, 82, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(89, 82, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(90, 82, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(91, 1, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(92, 1, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(93, 1, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(94, 1, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(95, 1, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(96, 1, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(97, 1, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(98, 1, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(99, 1, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(100, 1, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(101, 11, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(102, 11, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(103, 11, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(104, 11, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(105, 11, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(106, 11, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(107, 11, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(108, 11, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(109, 11, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(110, 11, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(111, 21, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(112, 21, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(113, 21, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(114, 21, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(115, 21, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(116, 21, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(117, 21, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(118, 21, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(119, 21, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(120, 21, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(121, 31, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(122, 31, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(123, 31, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(124, 31, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(125, 31, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(126, 31, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(127, 31, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(128, 31, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(129, 31, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(130, 31, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(131, 41, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(132, 41, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(133, 41, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(134, 41, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(135, 41, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(136, 41, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(137, 41, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(138, 41, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(139, 41, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(140, 41, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(141, 51, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(142, 51, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(143, 51, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(144, 51, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(145, 51, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(146, 51, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(147, 51, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(148, 51, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(149, 51, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(150, 51, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(151, 61, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(152, 61, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(153, 61, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(154, 61, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(155, 61, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(156, 61, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(157, 61, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(158, 61, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(159, 61, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(160, 61, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(161, 71, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(162, 71, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(163, 71, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(164, 71, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(165, 71, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(166, 71, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(167, 71, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(168, 71, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(169, 71, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(170, 71, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(171, 81, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(172, 81, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(173, 81, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(174, 81, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(175, 81, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(176, 81, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(177, 81, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(178, 81, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(179, 81, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(180, 81, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(181, 5, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(182, 5, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(183, 5, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(184, 5, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(185, 5, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(186, 5, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(187, 5, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(188, 5, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(189, 5, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(190, 5, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(191, 15, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(192, 15, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(193, 15, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(194, 15, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(195, 15, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(196, 15, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(197, 15, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(198, 15, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(199, 15, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(200, 15, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(201, 25, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(202, 25, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(203, 25, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(204, 25, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(205, 25, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(206, 25, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(207, 25, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(208, 25, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(209, 25, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(210, 25, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(211, 35, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(212, 35, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(213, 35, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(214, 35, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(215, 35, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(216, 35, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(217, 35, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(218, 35, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(219, 35, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(220, 35, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(221, 45, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(222, 45, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(223, 45, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(224, 45, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(225, 45, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(226, 45, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(227, 45, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(228, 45, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(229, 45, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(230, 45, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(231, 55, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(232, 55, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(233, 55, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(234, 55, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(235, 55, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(236, 55, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(237, 55, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(238, 55, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(239, 55, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(240, 55, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(241, 65, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(242, 65, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(243, 65, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(244, 65, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(245, 65, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(246, 65, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(247, 65, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(248, 65, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(249, 65, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(250, 65, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(251, 75, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(252, 75, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(253, 75, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(254, 75, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(255, 75, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(256, 75, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(257, 75, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(258, 75, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(259, 75, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(260, 75, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(261, 85, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(262, 85, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(263, 85, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(264, 85, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(265, 85, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(266, 85, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(267, 85, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(268, 85, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(269, 85, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(270, 85, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(271, 8, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(272, 8, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(273, 8, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(274, 8, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(275, 8, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(276, 8, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(277, 8, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(278, 8, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(279, 8, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(280, 8, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(281, 18, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(282, 18, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(283, 18, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(284, 18, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(285, 18, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(286, 18, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(287, 18, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(288, 18, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(289, 18, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(290, 18, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(291, 28, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(292, 28, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(293, 28, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(294, 28, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(295, 28, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(296, 28, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(297, 28, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(298, 28, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(299, 28, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(300, 28, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(301, 38, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(302, 38, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(303, 38, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(304, 38, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(305, 38, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(306, 38, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(307, 38, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(308, 38, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(309, 38, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(310, 38, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(311, 48, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(312, 48, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(313, 48, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(314, 48, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(315, 48, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(316, 48, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(317, 48, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(318, 48, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(319, 48, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(320, 48, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(321, 58, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(322, 58, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(323, 58, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(324, 58, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(325, 58, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(326, 58, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(327, 58, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(328, 58, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(329, 58, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(330, 58, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(331, 68, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(332, 68, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(333, 68, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(334, 68, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(335, 68, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(336, 68, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(337, 68, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(338, 68, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(339, 68, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(340, 68, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(341, 78, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(342, 78, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(343, 78, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(344, 78, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(345, 78, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(346, 78, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(347, 78, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(348, 78, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(349, 78, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(350, 78, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(351, 88, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(352, 88, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(353, 88, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(354, 88, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(355, 88, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(356, 88, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(357, 88, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(358, 88, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(359, 88, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(360, 88, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(361, 3, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(362, 3, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(363, 3, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(364, 3, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(365, 3, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(366, 3, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(367, 3, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(368, 3, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(369, 3, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(370, 3, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(371, 13, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(372, 13, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(373, 13, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(374, 13, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(375, 13, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(376, 13, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(377, 13, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(378, 13, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(379, 13, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(380, 13, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(381, 23, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(382, 23, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(383, 23, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(384, 23, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(385, 23, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(386, 23, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(387, 23, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(388, 23, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(389, 23, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(390, 23, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(391, 33, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(392, 33, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(393, 33, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(394, 33, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(395, 33, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(396, 33, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(397, 33, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(398, 33, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(399, 33, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(400, 33, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(401, 43, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(402, 43, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(403, 43, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(404, 43, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(405, 43, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(406, 43, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(407, 43, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(408, 43, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(409, 43, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(410, 43, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(411, 53, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(412, 53, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(413, 53, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(414, 53, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(415, 53, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(416, 53, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(417, 53, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(418, 53, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(419, 53, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(420, 53, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(421, 63, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(422, 63, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(423, 63, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(424, 63, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(425, 63, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(426, 63, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(427, 63, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(428, 63, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(429, 63, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(430, 63, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(431, 73, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(432, 73, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(433, 73, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(434, 73, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(435, 73, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(436, 73, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(437, 73, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(438, 73, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(439, 73, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(440, 73, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(441, 83, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(442, 83, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(443, 83, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(444, 83, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(445, 83, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(446, 83, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(447, 83, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(448, 83, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(449, 83, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(450, 83, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(451, 7, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(452, 7, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(453, 7, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(454, 7, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(455, 7, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(456, 7, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(457, 7, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(458, 7, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(459, 7, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(460, 7, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(461, 17, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(462, 17, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(463, 17, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(464, 17, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(465, 17, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(466, 17, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(467, 17, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(468, 17, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(469, 17, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(470, 17, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(471, 27, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(472, 27, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(473, 27, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(474, 27, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(475, 27, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(476, 27, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(477, 27, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(478, 27, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(479, 27, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(480, 27, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(481, 37, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(482, 37, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(483, 37, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(484, 37, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(485, 37, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(486, 37, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(487, 37, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(488, 37, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(489, 37, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(490, 37, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(491, 47, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(492, 47, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(493, 47, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(494, 47, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(495, 47, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(496, 47, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(497, 47, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(498, 47, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(499, 47, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(500, 47, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(501, 57, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(502, 57, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(503, 57, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(504, 57, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(505, 57, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(506, 57, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(507, 57, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(508, 57, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(509, 57, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(510, 57, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(511, 67, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(512, 67, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(513, 67, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(514, 67, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(515, 67, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(516, 67, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(517, 67, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(518, 67, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(519, 67, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(520, 67, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(521, 77, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(522, 77, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(523, 77, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(524, 77, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(525, 77, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(526, 77, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(527, 77, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(528, 77, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(529, 77, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(530, 77, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(531, 87, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(532, 87, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(533, 87, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(534, 87, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(535, 87, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(536, 87, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(537, 87, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(538, 87, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(539, 87, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(540, 87, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(541, 4, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(542, 4, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(543, 4, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(544, 4, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(545, 4, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(546, 4, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(547, 4, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(548, 4, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(549, 4, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(550, 4, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(551, 14, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(552, 14, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(553, 14, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(554, 14, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(555, 14, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(556, 14, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(557, 14, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(558, 14, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(559, 14, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(560, 14, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(561, 24, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(562, 24, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(563, 24, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(564, 24, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(565, 24, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(566, 24, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(567, 24, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(568, 24, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(569, 24, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(570, 24, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(571, 34, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(572, 34, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(573, 34, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(574, 34, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(575, 34, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(576, 34, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(577, 34, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(578, 34, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(579, 34, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(580, 34, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(581, 44, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(582, 44, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(583, 44, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(584, 44, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(585, 44, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(586, 44, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(587, 44, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(588, 44, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(589, 44, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(590, 44, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(591, 54, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(592, 54, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(593, 54, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(594, 54, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(595, 54, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(596, 54, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(597, 54, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(598, 54, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(599, 54, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(600, 54, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(601, 64, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(602, 64, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(603, 64, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(604, 64, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(605, 64, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(606, 64, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(607, 64, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(608, 64, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(609, 64, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(610, 64, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(611, 74, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(612, 74, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(613, 74, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(614, 74, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(615, 74, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(616, 74, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(617, 74, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(618, 74, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(619, 74, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(620, 74, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(621, 84, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(622, 84, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(623, 84, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(624, 84, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(625, 84, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(626, 84, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(627, 84, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(628, 84, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(629, 84, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(630, 84, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(631, 9, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(632, 9, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(633, 9, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(634, 9, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(635, 9, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(636, 9, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(637, 9, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(638, 9, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(639, 9, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(640, 9, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(641, 19, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(642, 19, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(643, 19, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(644, 19, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(645, 19, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(646, 19, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(647, 19, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(648, 19, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(649, 19, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(650, 19, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(651, 29, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(652, 29, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(653, 29, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(654, 29, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(655, 29, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(656, 29, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(657, 29, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(658, 29, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(659, 29, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(660, 29, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(661, 39, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(662, 39, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(663, 39, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(664, 39, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(665, 39, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(666, 39, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(667, 39, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(668, 39, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(669, 39, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(670, 39, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(671, 49, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(672, 49, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(673, 49, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(674, 49, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(675, 49, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(676, 49, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(677, 49, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(678, 49, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(679, 49, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(680, 49, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(681, 59, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(682, 59, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(683, 59, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(684, 59, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(685, 59, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(686, 59, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(687, 59, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(688, 59, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(689, 59, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(690, 59, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(691, 69, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(692, 69, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(693, 69, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(694, 69, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(695, 69, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(696, 69, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(697, 69, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(698, 69, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(699, 69, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(700, 69, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(701, 79, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(702, 79, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(703, 79, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(704, 79, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(705, 79, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(706, 79, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(707, 79, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(708, 79, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(709, 79, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(710, 79, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(711, 89, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(712, 89, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(713, 89, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(714, 89, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(715, 89, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(716, 89, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(717, 89, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(718, 89, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(719, 89, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(720, 89, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(721, 6, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(722, 6, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(723, 6, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(724, 6, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(725, 6, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(726, 6, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(727, 6, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(728, 6, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(729, 6, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(730, 6, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(731, 16, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(732, 16, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(733, 16, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(734, 16, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(735, 16, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(736, 16, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(737, 16, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(738, 16, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(739, 16, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(740, 16, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(741, 26, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(742, 26, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(743, 26, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(744, 26, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(745, 26, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(746, 26, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(747, 26, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(748, 26, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(749, 26, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(750, 26, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(751, 36, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(752, 36, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(753, 36, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(754, 36, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(755, 36, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(756, 36, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(757, 36, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(758, 36, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(759, 36, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(760, 36, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(761, 46, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(762, 46, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(763, 46, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(764, 46, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(765, 46, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(766, 46, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(767, 46, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(768, 46, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(769, 46, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(770, 46, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(771, 56, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(772, 56, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(773, 56, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(774, 56, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(775, 56, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(776, 56, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(777, 56, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(778, 56, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(779, 56, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(780, 56, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(781, 66, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(782, 66, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(783, 66, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(784, 66, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(785, 66, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(786, 66, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(787, 66, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(788, 66, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(789, 66, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(790, 66, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(791, 76, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(792, 76, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(793, 76, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(794, 76, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(795, 76, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(796, 76, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(797, 76, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(798, 76, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(799, 76, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(800, 76, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(801, 86, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(802, 86, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(803, 86, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(804, 86, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(805, 86, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(806, 86, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(807, 86, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(808, 86, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(809, 86, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(810, 86, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(811, 10, 21, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(812, 10, 20, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(813, 10, 19, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(814, 10, 18, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(815, 10, 17, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(816, 10, 16, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(817, 10, 15, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(818, 10, 14, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(819, 10, 13, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(820, 10, 12, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(821, 20, 31, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(822, 20, 30, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(823, 20, 29, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(824, 20, 28, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(825, 20, 27, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(826, 20, 26, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(827, 20, 25, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(828, 20, 24, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(829, 20, 23, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(830, 20, 22, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(831, 30, 41, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(832, 30, 40, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(833, 30, 39, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(834, 30, 38, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(835, 30, 37, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(836, 30, 36, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(837, 30, 35, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(838, 30, 34, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(839, 30, 33, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(840, 30, 32, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(841, 40, 51, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(842, 40, 50, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(843, 40, 49, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(844, 40, 48, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(845, 40, 47, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(846, 40, 46, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(847, 40, 45, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(848, 40, 44, '2025-09-23 07:06:07', '2025-09-23 07:06:07');
INSERT INTO `section_students` (`id`, `section_id`, `user_id`, `created_at`, `updated_at`) VALUES
(849, 40, 43, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(850, 40, 42, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(851, 50, 61, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(852, 50, 60, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(853, 50, 59, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(854, 50, 58, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(855, 50, 57, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(856, 50, 56, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(857, 50, 55, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(858, 50, 54, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(859, 50, 53, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(860, 50, 52, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(861, 60, 71, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(862, 60, 70, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(863, 60, 69, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(864, 60, 68, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(865, 60, 67, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(866, 60, 66, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(867, 60, 65, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(868, 60, 64, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(869, 60, 63, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(870, 60, 62, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(871, 70, 81, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(872, 70, 80, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(873, 70, 79, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(874, 70, 78, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(875, 70, 77, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(876, 70, 76, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(877, 70, 75, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(878, 70, 74, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(879, 70, 73, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(880, 70, 72, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(881, 80, 91, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(882, 80, 90, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(883, 80, 89, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(884, 80, 88, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(885, 80, 87, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(886, 80, 86, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(887, 80, 85, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(888, 80, 84, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(889, 80, 83, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(890, 80, 82, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(891, 90, 101, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(892, 90, 100, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(893, 90, 99, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(894, 90, 98, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(895, 90, 97, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(896, 90, 96, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(897, 90, 95, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(898, 90, 94, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(899, 90, 93, '2025-09-23 07:06:07', '2025-09-23 07:06:07'),
(900, 90, 92, '2025-09-23 07:06:07', '2025-09-23 07:06:07');

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
('Hp0jnQEMb9DiASijE6XzFUvCPMRbI1QVry5Ur0zZ', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiWHV6cmpraTVMT2J1SlZoR2s1ZWR3SFFzWFpqMkxjQ2M1N1VxUHk2SCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjI7fQ==', 1758690377),
('kwMLPrp06n59N4tR850VZVVcZ9JVS2GTPeyCFxLQ', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiR1lwTjR5SVFsdkpGOU03Q0h2a25Ya3QxNEphbmdmMVUxdXRRNEkxNyI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1758620002),
('OMKZN3bRSHKMeCqMBd96bfJGpOOE8XUhNoQJG6cl', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS2ZtS00yNGRNNllrMWVHQlVpQklEa0dWMEJPd3p4blI2N05aZndaNSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1758689424),
('qtrZsnUEsO8jjbINsimQbDdOjMF7e2gFRwGg9dFJ', 12, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiRmFGMmlXaWRSQVJMRXJGRGJqYXhrUXlXbFVrdDRJcjQ5VGE1UFpadSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9sb2dpbiI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjEyO30=', 1758612225),
('xRjQmRAKE5sRPauGLBEbcJ6yuMaYEDQYbfE1qMMQ', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiZjdJWlVhcnc5WVlES0paSDN4TUJLRk1DOWVDSTVxbEFoemRhQUNEMiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9ndXJ1L2Rhc2hib2FyZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjI7fQ==', 1758622638);

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
(11, 12, 'NIS00012', 2025, 'X IPA 1', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(12, 13, 'NIS00013', 2025, 'X IPA 1', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(13, 14, 'NIS00014', 2025, 'X IPA 1', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(14, 15, 'NIS00015', 2025, 'X IPA 1', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(15, 16, 'NIS00016', 2025, 'X IPA 1', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(16, 17, 'NIS00017', 2025, 'X IPA 1', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(17, 18, 'NIS00018', 2025, 'X IPA 1', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(18, 19, 'NIS00019', 2025, 'X IPA 1', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(19, 20, 'NIS00020', 2025, 'X IPA 1', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(20, 21, 'NIS00021', 2025, 'X IPA 1', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(21, 22, 'NIS00022', 2025, 'X IPA 2', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(22, 23, 'NIS00023', 2025, 'X IPA 2', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(23, 24, 'NIS00024', 2025, 'X IPA 2', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(24, 25, 'NIS00025', 2025, 'X IPA 2', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(25, 26, 'NIS00026', 2025, 'X IPA 2', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(26, 27, 'NIS00027', 2025, 'X IPA 2', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(27, 28, 'NIS00028', 2025, 'X IPA 2', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(28, 29, 'NIS00029', 2025, 'X IPA 2', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(29, 30, 'NIS00030', 2025, 'X IPA 2', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(30, 31, 'NIS00031', 2025, 'X IPA 2', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(31, 32, 'NIS00032', 2025, 'X IPS 1', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(32, 33, 'NIS00033', 2025, 'X IPS 1', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(33, 34, 'NIS00034', 2025, 'X IPS 1', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(34, 35, 'NIS00035', 2025, 'X IPS 1', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(35, 36, 'NIS00036', 2025, 'X IPS 1', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(36, 37, 'NIS00037', 2025, 'X IPS 1', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(37, 38, 'NIS00038', 2025, 'X IPS 1', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(38, 39, 'NIS00039', 2025, 'X IPS 1', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(39, 40, 'NIS00040', 2025, 'X IPS 1', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(40, 41, 'NIS00041', 2025, 'X IPS 1', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(41, 42, 'NIS00042', 2025, 'X IPS 2', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(42, 43, 'NIS00043', 2025, 'X IPS 2', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(43, 44, 'NIS00044', 2025, 'X IPS 2', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(44, 45, 'NIS00045', 2025, 'X IPS 2', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(45, 46, 'NIS00046', 2025, 'X IPS 2', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(46, 47, 'NIS00047', 2025, 'X IPS 2', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(47, 48, 'NIS00048', 2025, 'X IPS 2', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(48, 49, 'NIS00049', 2025, 'X IPS 2', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(49, 50, 'NIS00050', 2025, 'X IPS 2', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(50, 51, 'NIS00051', 2025, 'X IPS 2', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(51, 52, 'NIS00052', 2025, 'XI IPA 1', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(52, 53, 'NIS00053', 2025, 'XI IPA 1', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(53, 54, 'NIS00054', 2025, 'XI IPA 1', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(54, 55, 'NIS00055', 2025, 'XI IPA 1', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(55, 56, 'NIS00056', 2025, 'XI IPA 1', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(56, 57, 'NIS00057', 2025, 'XI IPA 1', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(57, 58, 'NIS00058', 2025, 'XI IPA 1', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(58, 59, 'NIS00059', 2025, 'XI IPA 1', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(59, 60, 'NIS00060', 2025, 'XI IPA 1', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(60, 61, 'NIS00061', 2025, 'XI IPA 1', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(61, 62, 'NIS00062', 2025, 'XI IPA 2', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(62, 63, 'NIS00063', 2025, 'XI IPA 2', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(63, 64, 'NIS00064', 2025, 'XI IPA 2', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(64, 65, 'NIS00065', 2025, 'XI IPA 2', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(65, 66, 'NIS00066', 2025, 'XI IPA 2', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(66, 67, 'NIS00067', 2025, 'XI IPA 2', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(67, 68, 'NIS00068', 2025, 'XI IPA 2', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(68, 69, 'NIS00069', 2025, 'XI IPA 2', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(69, 70, 'NIS00070', 2025, 'XI IPA 2', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(70, 71, 'NIS00071', 2025, 'XI IPA 2', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(71, 72, 'NIS00072', 2025, 'XI IPS 1', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(72, 73, 'NIS00073', 2025, 'XI IPS 1', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(73, 74, 'NIS00074', 2025, 'XI IPS 1', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(74, 75, 'NIS00075', 2025, 'XI IPS 1', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(75, 76, 'NIS00076', 2025, 'XI IPS 1', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(76, 77, 'NIS00077', 2025, 'XI IPS 1', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(77, 78, 'NIS00078', 2025, 'XI IPS 1', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(78, 79, 'NIS00079', 2025, 'XI IPS 1', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(79, 80, 'NIS00080', 2025, 'XI IPS 1', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(80, 81, 'NIS00081', 2025, 'XI IPS 1', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(81, 82, 'NIS00082', 2025, 'XI IPS 2', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(82, 83, 'NIS00083', 2025, 'XI IPS 2', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(83, 84, 'NIS00084', 2025, 'XI IPS 2', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(84, 85, 'NIS00085', 2025, 'XI IPS 2', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(85, 86, 'NIS00086', 2025, 'XI IPS 2', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(86, 87, 'NIS00087', 2025, 'XI IPS 2', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(87, 88, 'NIS00088', 2025, 'XI IPS 2', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(88, 89, 'NIS00089', 2025, 'XI IPS 2', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(89, 90, 'NIS00090', 2025, 'XI IPS 2', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(90, 91, 'NIS00091', 2025, 'XI IPS 2', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(91, 92, 'NIS00092', 2025, 'XII IPA 1', 1, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(92, 93, 'NIS00093', 2025, 'XII IPA 1', 2, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(93, 94, 'NIS00094', 2025, 'XII IPA 1', 3, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(94, 95, 'NIS00095', 2025, 'XII IPA 1', 4, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(95, 96, 'NIS00096', 2025, 'XII IPA 1', 5, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(96, 97, 'NIS00097', 2025, 'XII IPA 1', 6, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(97, 98, 'NIS00098', 2025, 'XII IPA 1', 7, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(98, 99, 'NIS00099', 2025, 'XII IPA 1', 8, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(99, 100, 'NIS00100', 2025, 'XII IPA 1', 9, '2025-09-22 17:26:06', '2025-09-22 17:26:06'),
(100, 101, 'NIS00101', 2025, 'XII IPA 1', 10, '2025-09-22 17:26:06', '2025-09-22 17:26:06');

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
(1, 'BIN-X-IPA1', 'Bahasa Indonesia — X IPA 1', 'Bahasa Indonesia untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(2, 'BIG-X-IPA1', 'Bahasa Inggris — X IPA 1', 'Bahasa Inggris untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(3, 'FIS-X-IPA1', 'Fisika — X IPA 1', 'Fisika untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(4, 'KIM-X-IPA1', 'Kimia — X IPA 1', 'Kimia untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(5, 'BIO-X-IPA1', 'Biologi — X IPA 1', 'Biologi untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(6, 'SEJ-X-IPA1', 'Sejarah — X IPA 1', 'Sejarah Indonesia untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(7, 'GEO-X-IPA1', 'Geografi — X IPA 1', 'Geografi untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(8, 'EKO-X-IPA1', 'Ekonomi — X IPA 1', 'Ekonomi untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(9, 'SBD-X-IPA1', 'Seni Budaya — X IPA 1', 'Seni Budaya untuk X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(10, 'WEB-X-IPA1', 'Pemrograman Web — X IPA 1', 'Dasar pemrograman web X IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(11, 'BIN-X-IPA2', 'Bahasa Indonesia — X IPA 2', 'Bahasa Indonesia untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(12, 'BIG-X-IPA2', 'Bahasa Inggris — X IPA 2', 'Bahasa Inggris untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(13, 'FIS-X-IPA2', 'Fisika — X IPA 2', 'Fisika untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(14, 'KIM-X-IPA2', 'Kimia — X IPA 2', 'Kimia untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(15, 'BIO-X-IPA2', 'Biologi — X IPA 2', 'Biologi untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(16, 'SEJ-X-IPA2', 'Sejarah — X IPA 2', 'Sejarah Indonesia untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(17, 'GEO-X-IPA2', 'Geografi — X IPA 2', 'Geografi untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(18, 'EKO-X-IPA2', 'Ekonomi — X IPA 2', 'Ekonomi untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(19, 'SBD-X-IPA2', 'Seni Budaya — X IPA 2', 'Seni Budaya untuk X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(20, 'WEB-X-IPA2', 'Pemrograman Web — X IPA 2', 'Dasar pemrograman web X IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(21, 'BIN-X-IPS1', 'Bahasa Indonesia — X IPS 1', 'Bahasa Indonesia untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(22, 'BIG-X-IPS1', 'Bahasa Inggris — X IPS 1', 'Bahasa Inggris untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(23, 'FIS-X-IPS1', 'Fisika — X IPS 1', 'Fisika untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(24, 'KIM-X-IPS1', 'Kimia — X IPS 1', 'Kimia untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(25, 'BIO-X-IPS1', 'Biologi — X IPS 1', 'Biologi untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(26, 'SEJ-X-IPS1', 'Sejarah — X IPS 1', 'Sejarah Indonesia untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(27, 'GEO-X-IPS1', 'Geografi — X IPS 1', 'Geografi untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(28, 'EKO-X-IPS1', 'Ekonomi — X IPS 1', 'Ekonomi untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(29, 'SBD-X-IPS1', 'Seni Budaya — X IPS 1', 'Seni Budaya untuk X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(30, 'WEB-X-IPS1', 'Pemrograman Web — X IPS 1', 'Dasar pemrograman web X IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(31, 'BIN-X-IPS2', 'Bahasa Indonesia — X IPS 2', 'Bahasa Indonesia untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(32, 'BIG-X-IPS2', 'Bahasa Inggris — X IPS 2', 'Bahasa Inggris untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(33, 'FIS-X-IPS2', 'Fisika — X IPS 2', 'Fisika untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(34, 'KIM-X-IPS2', 'Kimia — X IPS 2', 'Kimia untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(35, 'BIO-X-IPS2', 'Biologi — X IPS 2', 'Biologi untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(36, 'SEJ-X-IPS2', 'Sejarah — X IPS 2', 'Sejarah Indonesia untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(37, 'GEO-X-IPS2', 'Geografi — X IPS 2', 'Geografi untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(38, 'EKO-X-IPS2', 'Ekonomi — X IPS 2', 'Ekonomi untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(39, 'SBD-X-IPS2', 'Seni Budaya — X IPS 2', 'Seni Budaya untuk X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(40, 'WEB-X-IPS2', 'Pemrograman Web — X IPS 2', 'Dasar pemrograman web X IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(41, 'BIN-XI-IPA1', 'Bahasa Indonesia — XI IPA 1', 'Bahasa Indonesia untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(42, 'BIG-XI-IPA1', 'Bahasa Inggris — XI IPA 1', 'Bahasa Inggris untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(43, 'FIS-XI-IPA1', 'Fisika — XI IPA 1', 'Fisika untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(44, 'KIM-XI-IPA1', 'Kimia — XI IPA 1', 'Kimia untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(45, 'BIO-XI-IPA1', 'Biologi — XI IPA 1', 'Biologi untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(46, 'SEJ-XI-IPA1', 'Sejarah — XI IPA 1', 'Sejarah Indonesia untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(47, 'GEO-XI-IPA1', 'Geografi — XI IPA 1', 'Geografi untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(48, 'EKO-XI-IPA1', 'Ekonomi — XI IPA 1', 'Ekonomi untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(49, 'SBD-XI-IPA1', 'Seni Budaya — XI IPA 1', 'Seni Budaya untuk XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(50, 'WEB-XI-IPA1', 'Pemrograman Web — XI IPA 1', 'Dasar pemrograman web XI IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(51, 'BIN-XI-IPA2', 'Bahasa Indonesia — XI IPA 2', 'Bahasa Indonesia untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(52, 'BIG-XI-IPA2', 'Bahasa Inggris — XI IPA 2', 'Bahasa Inggris untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(53, 'FIS-XI-IPA2', 'Fisika — XI IPA 2', 'Fisika untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(54, 'KIM-XI-IPA2', 'Kimia — XI IPA 2', 'Kimia untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(55, 'BIO-XI-IPA2', 'Biologi — XI IPA 2', 'Biologi untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(56, 'SEJ-XI-IPA2', 'Sejarah — XI IPA 2', 'Sejarah Indonesia untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(57, 'GEO-XI-IPA2', 'Geografi — XI IPA 2', 'Geografi untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(58, 'EKO-XI-IPA2', 'Ekonomi — XI IPA 2', 'Ekonomi untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(59, 'SBD-XI-IPA2', 'Seni Budaya — XI IPA 2', 'Seni Budaya untuk XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(60, 'WEB-XI-IPA2', 'Pemrograman Web — XI IPA 2', 'Dasar pemrograman web XI IPA 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(61, 'BIN-XI-IPS1', 'Bahasa Indonesia — XI IPS 1', 'Bahasa Indonesia untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(62, 'BIG-XI-IPS1', 'Bahasa Inggris — XI IPS 1', 'Bahasa Inggris untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(63, 'FIS-XI-IPS1', 'Fisika — XI IPS 1', 'Fisika untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(64, 'KIM-XI-IPS1', 'Kimia — XI IPS 1', 'Kimia untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(65, 'BIO-XI-IPS1', 'Biologi — XI IPS 1', 'Biologi untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(66, 'SEJ-XI-IPS1', 'Sejarah — XI IPS 1', 'Sejarah Indonesia untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(67, 'GEO-XI-IPS1', 'Geografi — XI IPS 1', 'Geografi untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(68, 'EKO-XI-IPS1', 'Ekonomi — XI IPS 1', 'Ekonomi untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(69, 'SBD-XI-IPS1', 'Seni Budaya — XI IPS 1', 'Seni Budaya untuk XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(70, 'WEB-XI-IPS1', 'Pemrograman Web — XI IPS 1', 'Dasar pemrograman web XI IPS 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(71, 'BIN-XI-IPS2', 'Bahasa Indonesia — XI IPS 2', 'Bahasa Indonesia untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(72, 'BIG-XI-IPS2', 'Bahasa Inggris — XI IPS 2', 'Bahasa Inggris untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(73, 'FIS-XI-IPS2', 'Fisika — XI IPS 2', 'Fisika untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(74, 'KIM-XI-IPS2', 'Kimia — XI IPS 2', 'Kimia untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(75, 'BIO-XI-IPS2', 'Biologi — XI IPS 2', 'Biologi untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(76, 'SEJ-XI-IPS2', 'Sejarah — XI IPS 2', 'Sejarah Indonesia untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(77, 'GEO-XI-IPS2', 'Geografi — XI IPS 2', 'Geografi untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(78, 'EKO-XI-IPS2', 'Ekonomi — XI IPS 2', 'Ekonomi untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(79, 'SBD-XI-IPS2', 'Seni Budaya — XI IPS 2', 'Seni Budaya untuk XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(80, 'WEB-XI-IPS2', 'Pemrograman Web — XI IPS 2', 'Dasar pemrograman web XI IPS 2.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(81, 'BIN-XII-IPA1', 'Bahasa Indonesia — XII IPA 1', 'Bahasa Indonesia untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(82, 'BIG-XII-IPA1', 'Bahasa Inggris — XII IPA 1', 'Bahasa Inggris untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(83, 'FIS-XII-IPA1', 'Fisika — XII IPA 1', 'Fisika untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(84, 'KIM-XII-IPA1', 'Kimia — XII IPA 1', 'Kimia untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(85, 'BIO-XII-IPA1', 'Biologi — XII IPA 1', 'Biologi untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(86, 'SEJ-XII-IPA1', 'Sejarah — XII IPA 1', 'Sejarah Indonesia untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(87, 'GEO-XII-IPA1', 'Geografi — XII IPA 1', 'Geografi untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(88, 'EKO-XII-IPA1', 'Ekonomi — XII IPA 1', 'Ekonomi untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(89, 'SBD-XII-IPA1', 'Seni Budaya — XII IPA 1', 'Seni Budaya untuk XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14'),
(90, 'WEB-XII-IPA1', 'Pemrograman Web — XII IPA 1', 'Dasar pemrograman web XII IPA 1.', '2025-09-23 04:17:14', '2025-09-23 04:17:14');

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
(1, 'Administrator', 'admin@sims.com', '2025-09-10 19:23:59', '$2y$12$MHWciC2xq56ACHXLT5yTC.uub8KtHm.3Gwyk5xLfCzVPVLyPS5XTG', NULL, '2025-09-10 19:23:59', '2025-09-22 10:21:10'),
(2, 'Ahmad Pratama', 'ahmad.guru@sims.com', '2025-09-22 17:10:16', '$2y$12$NrmTnzuwAhBboxpUMZnmIu74OT/zMZ01G.9DsdRmgEfHICJXc.9k.', NULL, '2025-09-22 17:10:16', '2025-09-22 21:06:47'),
(3, 'Budi Santosa', 'budi.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(4, 'Citra Wulandari', 'citra.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(5, 'Dedi Prasetyo', 'dedi.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(6, 'Eka Saputra', 'eka.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(7, 'Fajar Hidayat', 'fajar.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(8, 'Gita Permata', 'gita.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(9, 'Hadi Kurniawan', 'hadi.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(10, 'Intan Lestari', 'intan.guru@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(11, 'Joko Priyono', 'joko.guru@sims.com', '2025-09-22 17:10:16', '$2y$12$GqBcLA4yddOXaFgbOcwFn.0lnmHl4znJQRjqjq6kVkE54Mnjxi/ry', NULL, '2025-09-22 17:10:16', '2025-09-22 10:46:35'),
(12, 'Andi Wijaya', 'andi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$12$GjNzNbLF8RUHbxoumkfXuOeVTNNR77G4.b.jNYRGC/jOjeUpSQXhq', NULL, '2025-09-22 17:10:16', '2025-09-22 10:45:49'),
(13, 'Bayu Setiawan', 'bayu.siswa@sims.com', '2025-09-22 17:10:16', '$2y$12$f7IjocnHaFE/8KISewm3heLVpNRX2GhC3BOyPj24HTXE1.t/FMryu', NULL, '2025-09-22 17:10:16', '2025-09-22 10:27:23'),
(14, 'Cindy Lestari', 'cindy.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(15, 'Dian Purnama', 'dian.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(16, 'Eko Yulianto', 'eko.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(17, 'Fitri Handayani', 'fitri.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(18, 'Galih Prabowo', 'galih.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(19, 'Hana Putri', 'hana.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(20, 'Irwan Saputra', 'irwan.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(21, 'Jihan Kartika', 'jihan.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(22, 'Kiki Amelia', 'kiki.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(23, 'Luthfi Ramadhan', 'luthfi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(24, 'Maya Sari', 'maya.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(25, 'Nanda Putra', 'nanda.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(26, 'Oka Prasetya', 'oka.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(27, 'Putri Anggraini', 'putri.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(28, 'Qori Rahma', 'qori.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(29, 'Raka Firmansyah', 'raka.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(30, 'Sinta Dewi', 'sinta.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(31, 'Tio Mahendra', 'tio.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(32, 'Umar Fadli', 'umar.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(33, 'Vina Maharani', 'vina.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(34, 'Wawan Hermawan', 'wawan.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(35, 'Xavier Pranata', 'xavier.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(36, 'Yuli Astuti', 'yuli.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(37, 'Zahra Aulia', 'zahra.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(38, 'Agus Salim', 'agus.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(39, 'Bella Anjani', 'bella.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(40, 'Chandra Adi', 'chandra.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(41, 'Dewi Sartika', 'dewi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(42, 'Erlangga Putra', 'erlangga.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(43, 'Farah Nabila', 'farah.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(44, 'Gilang Maulana', 'gilang.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(45, 'Helmi Fauzan', 'helmi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(46, 'Indah Sari', 'indah.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(47, 'Joko Susilo', 'joko.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(48, 'Kartika Ayu', 'kartika.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(49, 'Lukman Hakim', 'lukman.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(50, 'Mega Puspita', 'mega.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(51, 'Novan Saputra', 'novan.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(52, 'Olivya Putri', 'olivya.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(53, 'Prasetyo Adi', 'prasetyo.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(54, 'Qonita Zahra', 'qonita.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(55, 'Rizky Ramadhan', 'rizky.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(56, 'Salsa Amelia', 'salsa.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(57, 'Tegar Mahesa', 'tegar.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(58, 'Ulfah Nadira', 'ulfah.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(59, 'Vito Andrian', 'vito.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(60, 'Winda Oktavia', 'winda.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(61, 'Yogi Firmansyah', 'yogi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(62, 'Zulfa Hidayah', 'zulfa.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(63, 'Arif Setiawan', 'arif.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(64, 'Berliana Putri', 'berliana.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(65, 'Cahyo Nugroho', 'cahyo.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(66, 'Dinda Maharani', 'dinda.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(67, 'Evan Prasetyo', 'evan.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(68, 'Febriani Ayu', 'febriani.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(69, 'Gunawan Saputra', 'gunawan.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(70, 'Herlina Sari', 'herlina.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(71, 'Iqbal Ramadhan', 'iqbal.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(72, 'Jasmine Alia', 'jasmine.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(73, 'Kevin Aditya', 'kevin.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(74, 'Laras Intan', 'laras.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(75, 'Maulana Akbar', 'maulana.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(76, 'Nadia Ramadhani', 'nadia.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(77, 'Oscar Fernando', 'oscar.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(78, 'Putra Adi', 'putra.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(79, 'Qaisya Lestari', 'qaisya.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(80, 'Rani Wulandari', 'rani.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(81, 'Surya Dharma', 'surya.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(82, 'Tania Kusuma', 'tania.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(83, 'Untung Raharjo', 'untung.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(84, 'Vera Anggraini', 'vera.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(85, 'Widianto Prasetya', 'widianto.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(86, 'Xenia Safitri', 'xenia.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(87, 'Yoga Saputra', 'yoga.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(88, 'Zaki Anwar', 'zaki.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(89, 'Anisa Rahmah', 'anisa.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(90, 'Bagus Prakoso', 'bagus.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(91, 'Cahyani Dewi', 'cahyani.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(92, 'Davin Saputra', 'davin.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(93, 'Elsa Maharani', 'elsa.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(94, 'Fikri Zulfikar', 'fikri.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(95, 'Gresya Yolanda', 'gresya.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(96, 'Hafidz Syahputra', 'hafidz.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(97, 'Inayah Pertiwi', 'inayah.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(98, 'Jefri Andika', 'jefri.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(99, 'Kezia Putri', 'kezia.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(100, 'Laily Ramadhani', 'laily.siswa@sims.com', '2025-09-22 17:10:16', '$2y$12$wcz2wjMesqxOvz4sO9AdF.mOuoc.rPgN/ifQwe59cSacfI5m1vpDi', NULL, '2025-09-22 17:10:16', '2025-09-22 10:51:00'),
(101, 'Miko Prasetya', 'miko.siswa@sims.com', '2025-09-22 17:10:16', '$2y$12$UxZdoQaVYFy0gwqNQJmOheLfDw1c9TrYnWoximwfvAbzuhgg9zQ2K', NULL, '2025-09-22 17:10:16', '2025-09-22 10:51:18'),
(102, 'Nadya Amelia', 'nadya.siswa@sims.com', '2025-09-22 17:10:16', '$2y$12$qTKf/cQ10BQRRz4iTWSQtuT3eo2qOpm8ARZGnHRlwOQSWS.dhXoAy', NULL, '2025-09-22 17:10:16', '2025-09-22 10:52:20'),
(103, 'Okta Dwi', 'okta.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(104, 'Putu Ardi', 'putu.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(105, 'Qori Amalia', 'qori2.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(106, 'Rafi Akbar', 'rafi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(107, 'Shinta Anggraini', 'shinta.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(108, 'Taufik Hidayat', 'taufik.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(109, 'Umi Kalsum', 'umi.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(110, 'Valen Oktaviani', 'valen.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(111, 'Wira Aditya', 'wira.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(112, 'Xaviera Pratiwi', 'xaviera.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(113, 'Yoga Adi', 'yoga2.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16'),
(114, 'Zhafira Nur', 'zhafira.siswa@sims.com', '2025-09-22 17:10:16', '$2y$10$w2E5Vs9vSNU3L68JEwtone5EmJg9Kue4bSCIYlq7cSbN0WEtsy2om', NULL, '2025-09-22 17:10:16', '2025-09-22 17:10:16');

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attendance_details`
--
ALTER TABLE `attendance_details`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `chat_configs`
--
ALTER TABLE `chat_configs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `section_students`
--
ALTER TABLE `section_students`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=901;

--
-- AUTO_INCREMENT for table `siswa_profiles`
--
ALTER TABLE `siswa_profiles`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `terms`
--
ALTER TABLE `terms`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

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
