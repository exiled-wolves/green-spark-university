-- PostgreSQL Schema for Green Spark University
-- Converted from MySQL/MariaDB

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- Table: departments (must be created first due to FK references)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  acronym VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: academic_sessions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS academic_sessions (
  id SERIAL PRIMARY KEY,
  session VARCHAR(20) NOT NULL UNIQUE,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: admins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: applicants
-- --------------------------------------------------------
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE applicant_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS applicants (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  state_of_origin VARCHAR(100) NOT NULL,
  lga VARCHAR(100) NOT NULL,
  nationality VARCHAR(100) NOT NULL DEFAULT 'Nigerian',
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  passport_photo VARCHAR(255),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  jamb_reg_number VARCHAR(20) NOT NULL UNIQUE,
  jamb_score SMALLINT NOT NULL,
  olevel_results JSONB NOT NULL,
  next_of_kin_name VARCHAR(150) NOT NULL,
  next_of_kin_phone VARCHAR(20) NOT NULL,
  next_of_kin_relation VARCHAR(80) NOT NULL,
  residential_address TEXT NOT NULL,
  status applicant_status DEFAULT 'pending',
  applied_year INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_applicants_department ON applicants(department_id);

-- --------------------------------------------------------
-- Table: students
-- --------------------------------------------------------
CREATE TYPE student_status AS ENUM ('active', 'suspended');

CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  login_id VARCHAR(30) NOT NULL UNIQUE,
  applicant_id INTEGER NOT NULL UNIQUE REFERENCES applicants(id),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender gender_type NOT NULL,
  state_of_origin VARCHAR(100) NOT NULL,
  lga VARCHAR(100) NOT NULL,
  nationality VARCHAR(100) NOT NULL DEFAULT 'Nigerian',
  passport_photo VARCHAR(255),
  address TEXT NOT NULL,
  level SMALLINT NOT NULL DEFAULT 100,
  is_first_login BOOLEAN NOT NULL DEFAULT TRUE,
  status student_status DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);

-- --------------------------------------------------------
-- Table: lecturers
-- --------------------------------------------------------
CREATE TYPE lecturer_status AS ENUM ('active', 'on_leave', 'suspended');

CREATE TABLE IF NOT EXISTS lecturers (
  id SERIAL PRIMARY KEY,
  login_id VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  phone VARCHAR(20) NOT NULL,
  qualification VARCHAR(150),
  passport_photo VARCHAR(255),
  is_first_login BOOLEAN NOT NULL DEFAULT TRUE,
  status lecturer_status DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lecturers_department ON lecturers(department_id);

-- --------------------------------------------------------
-- Table: courses
-- --------------------------------------------------------
CREATE TYPE semester_type AS ENUM ('first', 'second');

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  credit_units SMALLINT NOT NULL DEFAULT 2,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  level SMALLINT NOT NULL,
  semester semester_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);

-- --------------------------------------------------------
-- Table: course_assignments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  lecturer_id INTEGER NOT NULL REFERENCES lecturers(id),
  session VARCHAR(20) NOT NULL,
  semester semester_type NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, lecturer_id, session, semester)
);

CREATE INDEX IF NOT EXISTS idx_course_assignments_lecturer ON course_assignments(lecturer_id);

-- --------------------------------------------------------
-- Table: course_registrations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_registrations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  session VARCHAR(20) NOT NULL,
  semester semester_type NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, session, semester)
);

CREATE INDEX IF NOT EXISTS idx_course_registrations_course ON course_registrations(course_id);

-- --------------------------------------------------------
-- Table: results
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  lecturer_id INTEGER NOT NULL REFERENCES lecturers(id),
  session VARCHAR(20) NOT NULL,
  semester semester_type NOT NULL,
  ca_score DECIMAL(5,2),
  exam_score DECIMAL(5,2),
  total_score DECIMAL(5,2) GENERATED ALWAYS AS (COALESCE(ca_score, 0) + COALESCE(exam_score, 0)) STORED,
  grade CHAR(2),
  remark VARCHAR(20),
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id, session, semester)
);

CREATE INDEX IF NOT EXISTS idx_results_course ON results(course_id);
CREATE INDEX IF NOT EXISTS idx_results_lecturer ON results(lecturer_id);

-- --------------------------------------------------------
-- Table: complaints
-- --------------------------------------------------------
CREATE TYPE sender_type AS ENUM ('student', 'lecturer');
CREATE TYPE complaint_status AS ENUM ('open', 'reviewed', 'resolved');

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  sender_type sender_type NOT NULL,
  sender_id INTEGER NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status complaint_status DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------
CREATE TYPE recipient_type AS ENUM ('student', 'lecturer', 'all_students');

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_type recipient_type NOT NULL,
  recipient_id INTEGER,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table: leave_applications
-- --------------------------------------------------------
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'maternity', 'study', 'other');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE IF NOT EXISTS leave_applications (
  id SERIAL PRIMARY KEY,
  lecturer_id INTEGER NOT NULL REFERENCES lecturers(id),
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status DEFAULT 'pending',
  admin_comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leave_applications_lecturer ON leave_applications(lecturer_id);

-- --------------------------------------------------------
-- Table: student_reports
-- --------------------------------------------------------
CREATE TYPE report_status AS ENUM ('pending', 'reviewed');

CREATE TABLE IF NOT EXISTS student_reports (
  id SERIAL PRIMARY KEY,
  lecturer_id INTEGER NOT NULL REFERENCES lecturers(id),
  student_id INTEGER NOT NULL REFERENCES students(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  reason TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_reports_lecturer ON student_reports(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_student_reports_student ON student_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_student_reports_course ON student_reports(course_id);

-- --------------------------------------------------------
-- Create function to auto-update updated_at column
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for tables with updated_at
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at
    BEFORE UPDATE ON results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at
    BEFORE UPDATE ON leave_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
