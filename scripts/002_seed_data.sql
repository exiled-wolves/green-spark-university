-- Seed data for Green Spark University
-- PostgreSQL version

-- --------------------------------------------------------
-- Seed: departments
-- --------------------------------------------------------
INSERT INTO departments (id, name, acronym, created_at) VALUES
(1, 'Computer Science', 'CSC', '2026-03-28 22:35:12+00'),
(2, 'Electrical Engineering', 'EEE', '2026-03-28 22:35:12+00'),
(3, 'Business Administration', 'BUS', '2026-03-28 22:35:12+00'),
(4, 'Mass Communication', 'MAC', '2026-03-28 22:35:12+00'),
(5, 'Accounting', 'ACC', '2026-03-28 22:35:12+00'),
(6, 'Law', 'LAW', '2026-03-28 22:35:12+00'),
(7, 'Medicine and Surgery', 'MED', '2026-03-28 22:35:12+00'),
(8, 'Civil Engineering', 'CVE', '2026-03-28 22:35:12+00');

-- Reset sequence
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- --------------------------------------------------------
-- Seed: academic_sessions
-- --------------------------------------------------------
INSERT INTO academic_sessions (id, session, is_current, created_at) VALUES
(1, '2024/2025', TRUE, '2026-03-28 22:35:12+00');

SELECT setval('academic_sessions_id_seq', (SELECT MAX(id) FROM academic_sessions));

-- --------------------------------------------------------
-- Seed: admins
-- --------------------------------------------------------
INSERT INTO admins (id, full_name, email, password, created_at) VALUES
(1, 'GSU Super Admin', 'admin@greensparkuni.edu.ng', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm3ycdO', '2026-03-28 22:35:12+00'),
(2, 'Edward Emmanuel', 'edemmanuel@greensparkuni.edu.ng', '$2a$12$B2AOTxeiLkKMU1u9j5Po6.T2jIMN8GD/nJ46Sbn7Rg00RyRdIGTrO', '2026-03-31 19:09:47+00');

SELECT setval('admins_id_seq', (SELECT MAX(id) FROM admins));

-- --------------------------------------------------------
-- Seed: applicants
-- --------------------------------------------------------
INSERT INTO applicants (id, full_name, date_of_birth, gender, state_of_origin, lga, nationality, phone, email, passport_photo, department_id, jamb_reg_number, jamb_score, olevel_results, next_of_kin_name, next_of_kin_phone, next_of_kin_relation, residential_address, status, applied_year, created_at) VALUES
(1, 'Edward Emmanuel', '2026-03-31', 'male', 'Taraba', 'Wukari', 'Nigerian', '09031691961', 'eddyemmanuel2001@gmail.com', '/uploads/1774983564596-789002.png', 1, '982828282BJ', 250, '[{"subject":"Chemistry","grade":"B3"},{"subject":"Physics","grade":"B3"},{"subject":"Geography","grade":"A1"},{"subject":"History","grade":"E8"},{"subject":"Technical Drawing","grade":"C6"}]', 'Goodman Emmanuel', '090494949494', 'Sibling', 'Pwadzu', 'accepted', 2026, '2026-03-31 18:59:24+00'),
(2, 'John Emmanuel', '2026-03-31', 'male', 'Taraba', 'Wukari', 'Nigerian', '0903169190', 'edemmanuel245@gmail.com', '/uploads/1774986118609-952288.jpeg', 7, '13798437894', 300, '[{"subject":"Christian Religious Studies","grade":"D7"},{"subject":"Food and Nutrition","grade":"C6"},{"subject":"Computer Studies","grade":"C6"},{"subject":"Geography","grade":"D7"},{"subject":"Further Mathematics","grade":"D7"}]', 'Goodman Emmanuel', '0903030049', 'Father', 'djhkhhdkkjljdknlk', 'rejected', 2026, '2026-03-31 19:41:58+00'),
(3, 'fghjkiloljk', '2026-03-27', 'male', 'Ekiti', 'Wukari', 'Nigerian', '09031691961', 'ede@gmail.com', '/uploads/1774986361815-348391.jpeg', 6, '8749749', 300, '[{"subject":"Physics","grade":"A1"},{"subject":"Mathematics","grade":"B2"},{"subject":"Civic Education","grade":"A1"},{"subject":"Civic Education","grade":"E8"},{"subject":"Food and Nutrition","grade":"D7"}]', 'Goodman Emmanuel', '90797979', 'Sibling', 'uiopeuiro', 'accepted', 2026, '2026-03-31 19:46:01+00'),
(4, 'Edward Emmanuel Dodo', '2026-03-27', 'female', 'FCT', 'Wukari', 'Nigerian', '95589595', 'eddyeleanor2001@gmail.com', '/uploads/1774988426737-324431.jpeg', 3, '9898000080', 70, '[{"subject":"Literature in English","grade":"A1"},{"subject":"Civic Education","grade":"B2"},{"subject":"Food and Nutrition","grade":"E8"},{"subject":"Food and Nutrition","grade":"C6"},{"subject":"Islamic Religious Studies","grade":"C6"}]', 'Vinking', '08136135310', 'Mother', 'hidhdkjd', 'accepted', 2026, '2026-03-31 20:20:26+00'),
(6, 'Amajiken Film', '2026-04-10', 'female', 'FCT', 'Wukari', 'Nigerian', '94804804', 'edemmanuel0803@gmail.com', '/uploads/1775074568087-831558.jpeg', 5, '290222', 200, '[{"subject":"Food and Nutrition","grade":"A1"},{"subject":"History","grade":"A1"},{"subject":"Further Mathematics","grade":"F9"},{"subject":"Technical Drawing","grade":"E8"},{"subject":"Commerce","grade":"F9"}]', 'Amazuken', '0494094904', 'Father', 'dkjskdjskjsksk', 'rejected', 2026, '2026-04-01 20:16:08+00'),
(7, 'Hans', '2026-04-08', 'female', 'FCT', 'Wukari', 'Nigerian', '09031691961', 'eddyemmanuel0803@gmail.com', '/uploads/1775074927019-524166.jpeg', 3, '90590055', 295, '[{"subject":"Computer Studies","grade":"B2"},{"subject":"Further Mathematics","grade":"F9"},{"subject":"Technical Drawing","grade":"B2"},{"subject":"Further Mathematics","grade":"E8"},{"subject":"Technical Drawing","grade":"D7"}]', 'oiddfoid', '9069696096', 'Father', 'klfkfklf', 'accepted', 2026, '2026-04-01 20:22:07+00'),
(8, 'Harrison John', '2026-04-22', 'male', 'Ebonyi', 'Wukari', 'Nigerian', '09031691961', 'talk2augustine807@gmail.com', '/uploads/1775109518687-819576.jpeg', 5, '858578575785BG', 300, '[{"subject":"English Language","grade":"A1"},{"subject":"Mathematics","grade":"A1"},{"subject":"Further Mathematics","grade":"B3"},{"subject":"Food and Nutrition","grade":"E8"},{"subject":"Christian Religious Studies","grade":"C6"}]', 'Goodman Emmanuel', '09031691961', 'Father', 'G.S.S. Wukari', 'accepted', 2026, '2026-04-02 05:58:38+00');

SELECT setval('applicants_id_seq', (SELECT MAX(id) FROM applicants));

-- --------------------------------------------------------
-- Seed: lecturers
-- --------------------------------------------------------
INSERT INTO lecturers (id, login_id, full_name, email, password, department_id, phone, qualification, passport_photo, is_first_login, status, created_at) VALUES
(1, 'GSU-LEC-1049', 'Edward Agu', 'edagu@greensparkuni.edu.ng', '$2b$10$DsBZLzH409Gc2VOFH/a8G.OwmLw2I7jIs2ONrb4fzuOD4RACAeBWm', 1, '09031691961', 'Masters Comp Sci', NULL, FALSE, 'active', '2026-03-31 21:23:41+00'),
(2, 'GSU-LEC-7811', 'Ernest John', 'ernest@gmail.com', '$2b$10$WVC/KAdYNbIINKo27wUcUuegnGLMOh446vecTRo3RYheBQlf9G/wG', 5, '09031691965', 'MSC Accounting', NULL, TRUE, 'active', '2026-04-02 06:00:23+00'),
(3, 'GSU-LEC-3639', 'John Was', 'john@gmail.com', '$2b$10$QQmnvoiWavPAJpRyZjxuf.fU.3CIEe274lw0FkbkGw73w4XL37guO', 5, '09031691950', 'MSC Accounting', NULL, TRUE, 'active', '2026-04-02 06:02:21+00'),
(4, 'GSU-LEC-7645', 'Reuben Smart', 'reuben@gmail.com', '$2b$10$lob5BWjGOQzxAkhWIxlYlujYpQaDkmEH.7L.4Qp.bWgo0DmvT6RPW', 6, '09060555004', 'MSC Law', NULL, FALSE, 'active', '2026-04-02 06:04:44+00');

SELECT setval('lecturers_id_seq', (SELECT MAX(id) FROM lecturers));

-- --------------------------------------------------------
-- Seed: students
-- --------------------------------------------------------
INSERT INTO students (id, login_id, applicant_id, full_name, email, password, department_id, phone, date_of_birth, gender, state_of_origin, lga, nationality, passport_photo, address, level, is_first_login, status, created_at) VALUES
(1, 'GSU/CSC/26/3190', 1, 'Edward Emmanuel', 'eddyemmanuel2001@gmail.com', '$2b$10$ZhKphg4OJ9WHVQpCWFTBteuG4.BOcbGTw7KJzVQeyGLMX9kuHBn16', 1, '09031691961', '2026-03-31', 'male', 'Taraba', 'Wukari', 'Nigerian', '/uploads/1774983564596-789002.png', 'Pwadzu', 100, FALSE, 'active', '2026-03-31 19:26:47+00'),
(2, 'GSU/LAW/26/1810', 3, 'fghjkiloljk', 'ede@gmail.com', '$2b$10$Xp7AVbrOs7mubxicQHTJruOwXVbY9HsBXGlLnYrufaxAduybL8BnS', 6, '09031691961', '2026-03-27', 'male', 'Ekiti', 'Wukari', 'Nigerian', '/uploads/1774986361815-348391.jpeg', 'uiopeuiro', 100, FALSE, 'active', '2026-03-31 19:46:24+00'),
(3, 'GSU/BUS/26/9534', 4, 'Edward Emmanuel Dodo', 'eddyeleanor2001@gmail.com', '$2b$10$MpZFJ4B0CtQ9VaCK1D/gi.e7LU.ik6mXYjCxMiX6aMMoP1I/vPMoO', 3, '95589595', '2026-03-27', 'female', 'FCT', 'Wukari', 'Nigerian', '/uploads/1774988426737-324431.jpeg', 'hidhdkjd', 100, FALSE, 'active', '2026-03-31 20:20:55+00'),
(4, 'GSU/BUS/26/8123', 7, 'Hans', 'eddyemmanuel0803@gmail.com', '$2b$10$2sv35u4TCyIwDd/9JTH2G.aBG9yYfvpiS7.f6T1bAAAvVhEKCktCu', 3, '09031691961', '2026-04-08', 'female', 'FCT', 'Wukari', 'Nigerian', '/uploads/1775074927019-524166.jpeg', 'klfkfklf', 100, TRUE, 'active', '2026-04-01 20:22:34+00'),
(5, 'GSU/ACC/26/3582', 8, 'Harrison John', 'talk2augustine807@gmail.com', '$2b$10$UQ2pWtuJwlJxYhBnUDOzoODUp7qKriG9U.UGKXRTe/rBKGmbOziuu', 5, '09031691961', '2026-04-22', 'male', 'Ebonyi', 'Wukari', 'Nigerian', '/uploads/1775109518687-819576.jpeg', 'G.S.S. Wukari', 100, FALSE, 'active', '2026-04-02 05:59:12+00');

SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));

-- --------------------------------------------------------
-- Seed: courses
-- --------------------------------------------------------
INSERT INTO courses (id, course_code, title, description, credit_units, department_id, level, semester, is_active, created_at) VALUES
(1, 'CSC 419', 'Discrete Structures', NULL, 3, 1, 400, 'first', TRUE, '2026-04-01 20:12:42+00'),
(2, 'LAW 102', 'Law', NULL, 2, 6, 100, 'first', TRUE, '2026-04-02 00:57:23+00'),
(3, 'CSC 101', 'Introduction to computer', NULL, 2, 1, 100, 'first', TRUE, '2026-04-02 02:09:18+00'),
(4, 'LAW 101', 'Intro to Law', 'Law office', 3, 6, 100, 'first', TRUE, '2026-04-02 06:07:01+00');

SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

-- --------------------------------------------------------
-- Seed: course_assignments
-- --------------------------------------------------------
INSERT INTO course_assignments (id, course_id, lecturer_id, session, semester, created_at) VALUES
(1, 1, 1, '2024/2025', 'first', '2026-04-01 20:12:58+00'),
(2, 3, 1, '2024/2025', 'first', '2026-04-02 02:11:18+00'),
(3, 2, 4, '2024/2025', 'second', '2026-04-02 06:07:18+00'),
(4, 1, 2, '2024/2025', 'second', '2026-04-02 06:07:46+00');

SELECT setval('course_assignments_id_seq', (SELECT MAX(id) FROM course_assignments));

-- --------------------------------------------------------
-- Seed: course_registrations
-- --------------------------------------------------------
INSERT INTO course_registrations (id, student_id, course_id, session, semester, registered_at) VALUES
(1, 1, 3, '2024/2025', 'first', '2026-04-02 02:10:24+00'),
(2, 2, 4, '2024/2025', 'first', '2026-04-02 06:09:23+00'),
(3, 2, 2, '2024/2025', 'first', '2026-04-02 06:09:25+00');

SELECT setval('course_registrations_id_seq', (SELECT MAX(id) FROM course_registrations));

-- --------------------------------------------------------
-- Seed: results
-- --------------------------------------------------------
INSERT INTO results (id, student_id, course_id, lecturer_id, session, semester, ca_score, exam_score, grade, remark, uploaded_at, updated_at) 
OVERRIDING SYSTEM VALUE VALUES
(1, 1, 3, 1, '2024/2025', 'first', 20.00, 40.00, 'B', 'Pass', '2026-04-02 02:12:22+00', '2026-04-02 02:12:22+00');

SELECT setval('results_id_seq', (SELECT MAX(id) FROM results));

-- --------------------------------------------------------
-- Seed: complaints
-- --------------------------------------------------------
INSERT INTO complaints (id, sender_type, sender_id, subject, message, status, admin_reply, created_at, updated_at) VALUES
(1, 'student', 1, 'Lecturer Failed Me', 'A lecturer failed me', 'resolved', 'Don''t worry', '2026-04-01 21:53:19+00', '2026-04-02 02:08:25+00'),
(2, 'lecturer', 1, 'kdjld', 'joidkhij', 'resolved', 'kflkddk', '2026-04-02 00:53:35+00', '2026-04-02 00:56:33+00');

SELECT setval('complaints_id_seq', (SELECT MAX(id) FROM complaints));

-- --------------------------------------------------------
-- Seed: leave_applications
-- --------------------------------------------------------
INSERT INTO leave_applications (id, lecturer_id, leave_type, start_date, end_date, reason, status, admin_comment, created_at, updated_at) VALUES
(1, 1, 'sick', '2026-04-29', '2026-04-30', 'oiueoe', 'rejected', NULL, '2026-04-02 01:15:05+00', '2026-04-02 02:08:34+00');

SELECT setval('leave_applications_id_seq', (SELECT MAX(id) FROM leave_applications));

-- --------------------------------------------------------
-- Seed: notifications
-- --------------------------------------------------------
INSERT INTO notifications (id, recipient_type, recipient_id, title, message, is_read, created_at) VALUES
(1, 'student', 1, 'Result uploaded', 'Your result for CSC 101 — Introduction to computer (2024/2025 first semester) has been uploaded. Total: 60/100, Grade: B.', TRUE, '2026-04-02 02:12:22+00');

SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));
