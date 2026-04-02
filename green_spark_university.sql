-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 02, 2026 at 08:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `green_spark_university`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_sessions`
--

CREATE TABLE `academic_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `session` varchar(20) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_sessions`
--

INSERT INTO `academic_sessions` (`id`, `session`, `is_current`, `created_at`) VALUES
(1, '2024/2025', 1, '2026-03-28 22:35:12');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `full_name`, `email`, `password`, `created_at`) VALUES
(1, 'GSU Super Admin', 'admin@greensparkuni.edu.ng', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm3ycdO', '2026-03-28 22:35:12'),
(2, 'Edward Emmanuel', 'edemmanuel@greensparkuni.edu.ng', '$2a$12$B2AOTxeiLkKMU1u9j5Po6.T2jIMN8GD/nJ46Sbn7Rg00RyRdIGTrO', '2026-03-31 19:09:47');

-- --------------------------------------------------------

--
-- Table structure for table `applicants`
--

CREATE TABLE `applicants` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `state_of_origin` varchar(100) NOT NULL,
  `lga` varchar(100) NOT NULL,
  `nationality` varchar(100) NOT NULL DEFAULT 'Nigerian',
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) NOT NULL,
  `passport_photo` varchar(255) DEFAULT NULL,
  `department_id` int(10) UNSIGNED NOT NULL,
  `jamb_reg_number` varchar(20) NOT NULL,
  `jamb_score` smallint(6) NOT NULL,
  `olevel_results` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`olevel_results`)),
  `next_of_kin_name` varchar(150) NOT NULL,
  `next_of_kin_phone` varchar(20) NOT NULL,
  `next_of_kin_relation` varchar(80) NOT NULL,
  `residential_address` text NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `applied_year` year(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applicants`
--

INSERT INTO `applicants` (`id`, `full_name`, `date_of_birth`, `gender`, `state_of_origin`, `lga`, `nationality`, `phone`, `email`, `passport_photo`, `department_id`, `jamb_reg_number`, `jamb_score`, `olevel_results`, `next_of_kin_name`, `next_of_kin_phone`, `next_of_kin_relation`, `residential_address`, `status`, `applied_year`, `created_at`) VALUES
(1, 'Edward Emmanuel', '2026-03-31', 'male', 'Taraba', 'Wukari', 'Nigerian', '09031691961', 'eddyemmanuel2001@gmail.com', '/uploads/1774983564596-789002.png', 1, '982828282BJ', 250, '[{\"subject\":\"Chemistry\",\"grade\":\"B3\"},{\"subject\":\"Physics\",\"grade\":\"B3\"},{\"subject\":\"Geography\",\"grade\":\"A1\"},{\"subject\":\"History\",\"grade\":\"E8\"},{\"subject\":\"Technical Drawing\",\"grade\":\"C6\"}]', 'Goodman Emmanuel', '090494949494', 'Sibling', 'Pwadzu', 'accepted', '2026', '2026-03-31 18:59:24'),
(2, 'John Emmanuel', '2026-03-31', 'male', 'Taraba', 'Wukari', 'Nigerian', '0903169190', 'edemmanuel245@gmail.com', '/uploads/1774986118609-952288.jpeg', 7, '13798437894', 300, '[{\"subject\":\"Christian Religious Studies\",\"grade\":\"D7\"},{\"subject\":\"Food and Nutrition\",\"grade\":\"C6\"},{\"subject\":\"Computer Studies\",\"grade\":\"C6\"},{\"subject\":\"Geography\",\"grade\":\"D7\"},{\"subject\":\"Further Mathematics\",\"grade\":\"D7\"}]', 'Goodman Emmanuel', '0903030049', 'Father', 'djhkhhdkkjljdknlk', 'rejected', '2026', '2026-03-31 19:41:58'),
(3, 'fghjkiloljk', '2026-03-27', 'male', 'Ekiti', 'Wukari', 'Nigerian', '09031691961', 'ede@gmail.com', '/uploads/1774986361815-348391.jpeg', 6, '8749749', 300, '[{\"subject\":\"Physics\",\"grade\":\"A1\"},{\"subject\":\"Mathematics\",\"grade\":\"B2\"},{\"subject\":\"Civic Education\",\"grade\":\"A1\"},{\"subject\":\"Civic Education\",\"grade\":\"E8\"},{\"subject\":\"Food and Nutrition\",\"grade\":\"D7\"}]', 'Goodman Emmanuel', '90797979', 'Sibling', 'uiopeuiro', 'accepted', '2026', '2026-03-31 19:46:01'),
(4, 'Edward Emmanuel Dodo', '2026-03-27', 'female', 'FCT', 'Wukari', 'Nigerian', '95589595', 'eddyeleanor2001@gmail.com', '/uploads/1774988426737-324431.jpeg', 3, '9898000080', 70, '[{\"subject\":\"Literature in English\",\"grade\":\"A1\"},{\"subject\":\"Civic Education\",\"grade\":\"B2\"},{\"subject\":\"Food and Nutrition\",\"grade\":\"E8\"},{\"subject\":\"Food and Nutrition\",\"grade\":\"C6\"},{\"subject\":\"Islamic Religious Studies\",\"grade\":\"C6\"}]', 'Vinking', '08136135310', 'Mother', 'hidhdkjd', 'accepted', '2026', '2026-03-31 20:20:26'),
(6, 'Amajiken Film', '2026-04-10', 'female', 'FCT', 'Wukari', 'Nigerian', '94804804', 'edemmanuel0803@gmail.com', '/uploads/1775074568087-831558.jpeg', 5, '290222', 200, '[{\"subject\":\"Food and Nutrition\",\"grade\":\"A1\"},{\"subject\":\"History\",\"grade\":\"A1\"},{\"subject\":\"Further Mathematics\",\"grade\":\"F9\"},{\"subject\":\"Technical Drawing\",\"grade\":\"E8\"},{\"subject\":\"Commerce\",\"grade\":\"F9\"}]', 'Amazuken', '0494094904', 'Father', 'dkjskdjskjsksk', 'rejected', '2026', '2026-04-01 20:16:08'),
(7, 'Hans', '2026-04-08', 'female', 'FCT', 'Wukari', 'Nigerian', '09031691961', 'eddyemmanuel0803@gmail.com', '/uploads/1775074927019-524166.jpeg', 3, '90590055', 295, '[{\"subject\":\"Computer Studies\",\"grade\":\"B2\"},{\"subject\":\"Further Mathematics\",\"grade\":\"F9\"},{\"subject\":\"Technical Drawing\",\"grade\":\"B2\"},{\"subject\":\"Further Mathematics\",\"grade\":\"E8\"},{\"subject\":\"Technical Drawing\",\"grade\":\"D7\"}]', 'oiddfoid', '9069696096', 'Father', 'klfkfklf', 'accepted', '2026', '2026-04-01 20:22:07'),
(8, 'Harrison John', '2026-04-22', 'male', 'Ebonyi', 'Wukari', 'Nigerian', '09031691961', 'talk2augustine807@gmail.com', '/uploads/1775109518687-819576.jpeg', 5, '858578575785BG', 300, '[{\"subject\":\"English Language\",\"grade\":\"A1\"},{\"subject\":\"Mathematics\",\"grade\":\"A1\"},{\"subject\":\"Further Mathematics\",\"grade\":\"B3\"},{\"subject\":\"Food and Nutrition\",\"grade\":\"E8\"},{\"subject\":\"Christian Religious Studies\",\"grade\":\"C6\"}]', 'Goodman Emmanuel', '09031691961', 'Father', 'G.S.S. Wukari', 'accepted', '2026', '2026-04-02 05:58:38');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(10) UNSIGNED NOT NULL,
  `sender_type` enum('student','lecturer') NOT NULL,
  `sender_id` int(10) UNSIGNED NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','reviewed','resolved') DEFAULT 'open',
  `admin_reply` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `sender_type`, `sender_id`, `subject`, `message`, `status`, `admin_reply`, `created_at`, `updated_at`) VALUES
(1, 'student', 1, 'Lecturer Failed Me', 'A lecturer failed me', 'resolved', 'Don\'t worry\n', '2026-04-01 21:53:19', '2026-04-02 02:08:25'),
(2, 'lecturer', 1, 'kdjld', 'joidkhij', 'resolved', 'kflkddk', '2026-04-02 00:53:35', '2026-04-02 00:56:33');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(10) UNSIGNED NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `credit_units` tinyint(4) NOT NULL DEFAULT 2,
  `department_id` int(10) UNSIGNED NOT NULL,
  `level` smallint(6) NOT NULL,
  `semester` enum('first','second') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `course_code`, `title`, `description`, `credit_units`, `department_id`, `level`, `semester`, `is_active`, `created_at`) VALUES
(1, 'CSC 419', 'Discrete Structures', NULL, 3, 1, 400, 'first', 1, '2026-04-01 20:12:42'),
(2, 'LAW 102', 'Law', NULL, 2, 6, 100, 'first', 1, '2026-04-02 00:57:23'),
(3, 'CSC 101', 'Introduction to computer', NULL, 2, 1, 100, 'first', 1, '2026-04-02 02:09:18'),
(4, 'LAW 101', 'Intro to Law', 'Law office', 3, 6, 100, 'first', 1, '2026-04-02 06:07:01');

-- --------------------------------------------------------

--
-- Table structure for table `course_assignments`
--

CREATE TABLE `course_assignments` (
  `id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `lecturer_id` int(10) UNSIGNED NOT NULL,
  `session` varchar(20) NOT NULL,
  `semester` enum('first','second') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_assignments`
--

INSERT INTO `course_assignments` (`id`, `course_id`, `lecturer_id`, `session`, `semester`, `created_at`) VALUES
(1, 1, 1, '2024/2025', 'first', '2026-04-01 20:12:58'),
(2, 3, 1, '2024/2025', 'first', '2026-04-02 02:11:18'),
(3, 2, 4, '2024/2025', 'second', '2026-04-02 06:07:18'),
(4, 1, 2, '2024/2025', 'second', '2026-04-02 06:07:46');

-- --------------------------------------------------------

--
-- Table structure for table `course_registrations`
--

CREATE TABLE `course_registrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `session` varchar(20) NOT NULL,
  `semester` enum('first','second') NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_registrations`
--

INSERT INTO `course_registrations` (`id`, `student_id`, `course_id`, `session`, `semester`, `registered_at`) VALUES
(1, 1, 3, '2024/2025', 'first', '2026-04-02 02:10:24'),
(2, 2, 4, '2024/2025', 'first', '2026-04-02 06:09:23'),
(3, 2, 2, '2024/2025', 'first', '2026-04-02 06:09:25');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `acronym` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `acronym`, `created_at`) VALUES
(1, 'Computer Science', 'CSC', '2026-03-28 22:35:12'),
(2, 'Electrical Engineering', 'EEE', '2026-03-28 22:35:12'),
(3, 'Business Administration', 'BUS', '2026-03-28 22:35:12'),
(4, 'Mass Communication', 'MAC', '2026-03-28 22:35:12'),
(5, 'Accounting', 'ACC', '2026-03-28 22:35:12'),
(6, 'Law', 'LAW', '2026-03-28 22:35:12'),
(7, 'Medicine and Surgery', 'MED', '2026-03-28 22:35:12'),
(8, 'Civil Engineering', 'CVE', '2026-03-28 22:35:12');

-- --------------------------------------------------------

--
-- Table structure for table `leave_applications`
--

CREATE TABLE `leave_applications` (
  `id` int(10) UNSIGNED NOT NULL,
  `lecturer_id` int(10) UNSIGNED NOT NULL,
  `leave_type` enum('annual','sick','maternity','study','other') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_applications`
--

INSERT INTO `leave_applications` (`id`, `lecturer_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `admin_comment`, `created_at`, `updated_at`) VALUES
(1, 1, 'sick', '2026-04-29', '2026-04-30', 'oiueoe', 'rejected', NULL, '2026-04-02 01:15:05', '2026-04-02 02:08:34');

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE `lecturers` (
  `id` int(10) UNSIGNED NOT NULL,
  `login_id` varchar(30) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department_id` int(10) UNSIGNED NOT NULL,
  `phone` varchar(20) NOT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `passport_photo` varchar(255) DEFAULT NULL,
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','on_leave','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id`, `login_id`, `full_name`, `email`, `password`, `department_id`, `phone`, `qualification`, `passport_photo`, `is_first_login`, `status`, `created_at`) VALUES
(1, 'GSU-LEC-1049', 'Edward Agu', 'edagu@greensparkuni.edu.ng', '$2b$10$DsBZLzH409Gc2VOFH/a8G.OwmLw2I7jIs2ONrb4fzuOD4RACAeBWm', 1, '09031691961', 'Masters Comp Sci', NULL, 0, 'active', '2026-03-31 21:23:41'),
(2, 'GSU-LEC-7811', 'Ernest John', 'ernest@gmail.com', '$2b$10$WVC/KAdYNbIINKo27wUcUuegnGLMOh446vecTRo3RYheBQlf9G/wG', 5, '09031691965', 'MSC Accounting', NULL, 1, 'active', '2026-04-02 06:00:23'),
(3, 'GSU-LEC-3639', 'John Was', 'john@gmail.com', '$2b$10$QQmnvoiWavPAJpRyZjxuf.fU.3CIEe274lw0FkbkGw73w4XL37guO', 5, '09031691950', 'MSC Accounting', NULL, 1, 'active', '2026-04-02 06:02:21'),
(4, 'GSU-LEC-7645', 'Reuben Smart', 'reuben@gmail.com', '$2b$10$lob5BWjGOQzxAkhWIxlYlujYpQaDkmEH.7L.4Qp.bWgo0DmvT6RPW', 6, '09060555004', 'MSC Law', NULL, 0, 'active', '2026-04-02 06:04:44');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `recipient_type` enum('student','lecturer','all_students') NOT NULL,
  `recipient_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `recipient_type`, `recipient_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 'student', 1, 'Result uploaded', 'Your result for CSC 101 — Introduction to computer (2024/2025 first semester) has been uploaded. Total: 60/100, Grade: B.', 1, '2026-04-02 02:12:22');

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `lecturer_id` int(10) UNSIGNED NOT NULL,
  `session` varchar(20) NOT NULL,
  `semester` enum('first','second') NOT NULL,
  `ca_score` decimal(5,2) DEFAULT NULL,
  `exam_score` decimal(5,2) DEFAULT NULL,
  `total_score` decimal(5,2) GENERATED ALWAYS AS (coalesce(`ca_score`,0) + coalesce(`exam_score`,0)) STORED,
  `grade` char(2) DEFAULT NULL,
  `remark` varchar(20) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `results`
--

INSERT INTO `results` (`id`, `student_id`, `course_id`, `lecturer_id`, `session`, `semester`, `ca_score`, `exam_score`, `grade`, `remark`, `uploaded_at`, `updated_at`) VALUES
(1, 1, 3, 1, '2024/2025', 'first', 20.00, 40.00, 'B', 'Pass', '2026-04-02 02:12:22', '2026-04-02 02:12:22');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(10) UNSIGNED NOT NULL,
  `login_id` varchar(30) NOT NULL,
  `applicant_id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department_id` int(10) UNSIGNED NOT NULL,
  `phone` varchar(20) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `state_of_origin` varchar(100) NOT NULL,
  `lga` varchar(100) NOT NULL,
  `nationality` varchar(100) NOT NULL DEFAULT 'Nigerian',
  `passport_photo` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `level` smallint(6) NOT NULL DEFAULT 100,
  `is_first_login` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('active','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `login_id`, `applicant_id`, `full_name`, `email`, `password`, `department_id`, `phone`, `date_of_birth`, `gender`, `state_of_origin`, `lga`, `nationality`, `passport_photo`, `address`, `level`, `is_first_login`, `status`, `created_at`) VALUES
(1, 'GSU/CSC/26/3190', 1, 'Edward Emmanuel', 'eddyemmanuel2001@gmail.com', '$2b$10$ZhKphg4OJ9WHVQpCWFTBteuG4.BOcbGTw7KJzVQeyGLMX9kuHBn16', 1, '09031691961', '2026-03-31', 'male', 'Taraba', 'Wukari', 'Nigerian', '/uploads/1774983564596-789002.png', 'Pwadzu', 100, 0, 'active', '2026-03-31 19:26:47'),
(2, 'GSU/LAW/26/1810', 3, 'fghjkiloljk', 'ede@gmail.com', '$2b$10$Xp7AVbrOs7mubxicQHTJruOwXVbY9HsBXGlLnYrufaxAduybL8BnS', 6, '09031691961', '2026-03-27', 'male', 'Ekiti', 'Wukari', 'Nigerian', '/uploads/1774986361815-348391.jpeg', 'uiopeuiro', 100, 0, 'active', '2026-03-31 19:46:24'),
(3, 'GSU/BUS/26/9534', 4, 'Edward Emmanuel Dodo', 'eddyeleanor2001@gmail.com', '$2b$10$MpZFJ4B0CtQ9VaCK1D/gi.e7LU.ik6mXYjCxMiX6aMMoP1I/vPMoO', 3, '95589595', '2026-03-27', 'female', 'FCT', 'Wukari', 'Nigerian', '/uploads/1774988426737-324431.jpeg', 'hidhdkjd', 100, 0, 'active', '2026-03-31 20:20:55'),
(4, 'GSU/BUS/26/8123', 7, 'Hans', 'eddyemmanuel0803@gmail.com', '$2b$10$2sv35u4TCyIwDd/9JTH2G.aBG9yYfvpiS7.f6T1bAAAvVhEKCktCu', 3, '09031691961', '2026-04-08', 'female', 'FCT', 'Wukari', 'Nigerian', '/uploads/1775074927019-524166.jpeg', 'klfkfklf', 100, 1, 'active', '2026-04-01 20:22:34'),
(5, 'GSU/ACC/26/3582', 8, 'Harrison John', 'talk2augustine807@gmail.com', '$2b$10$UQ2pWtuJwlJxYhBnUDOzoODUp7qKriG9U.UGKXRTe/rBKGmbOziuu', 5, '09031691961', '2026-04-22', 'male', 'Ebonyi', 'Wukari', 'Nigerian', '/uploads/1775109518687-819576.jpeg', 'G.S.S. Wukari', 100, 0, 'active', '2026-04-02 05:59:12');

-- --------------------------------------------------------

--
-- Table structure for table `student_reports`
--

CREATE TABLE `student_reports` (
  `id` int(10) UNSIGNED NOT NULL,
  `lecturer_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `course_id` int(10) UNSIGNED NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','reviewed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session` (`session`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `applicants`
--
ALTER TABLE `applicants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `jamb_reg_number` (`jamb_reg_number`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_code` (`course_code`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `course_assignments`
--
ALTER TABLE `course_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`course_id`,`lecturer_id`,`session`,`semester`),
  ADD KEY `lecturer_id` (`lecturer_id`);

--
-- Indexes for table `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_registration` (`student_id`,`course_id`,`session`,`semester`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `acronym` (`acronym`);

--
-- Indexes for table `leave_applications`
--
ALTER TABLE `leave_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lecturer_id` (`lecturer_id`);

--
-- Indexes for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login_id` (`login_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_result` (`student_id`,`course_id`,`session`,`semester`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `lecturer_id` (`lecturer_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `login_id` (`login_id`),
  ADD UNIQUE KEY `applicant_id` (`applicant_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `student_reports`
--
ALTER TABLE `student_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lecturer_id` (`lecturer_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `course_id` (`course_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `applicants`
--
ALTER TABLE `applicants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `course_assignments`
--
ALTER TABLE `course_assignments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `course_registrations`
--
ALTER TABLE `course_registrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `leave_applications`
--
ALTER TABLE `leave_applications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lecturers`
--
ALTER TABLE `lecturers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `student_reports`
--
ALTER TABLE `student_reports`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `applicants`
--
ALTER TABLE `applicants`
  ADD CONSTRAINT `applicants_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `course_assignments`
--
ALTER TABLE `course_assignments`
  ADD CONSTRAINT `course_assignments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `course_assignments_ibfk_2` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`);

--
-- Constraints for table `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD CONSTRAINT `course_registrations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `course_registrations_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);

--
-- Constraints for table `leave_applications`
--
ALTER TABLE `leave_applications`
  ADD CONSTRAINT `leave_applications_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`);

--
-- Constraints for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `results_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  ADD CONSTRAINT `results_ibfk_3` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`applicant_id`) REFERENCES `applicants` (`id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `student_reports`
--
ALTER TABLE `student_reports`
  ADD CONSTRAINT `student_reports_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`),
  ADD CONSTRAINT `student_reports_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `student_reports_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
