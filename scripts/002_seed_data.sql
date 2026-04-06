-- Seed data for Green Spark University
-- This creates essential initial data

-- --------------------------------------------------------
-- Insert departments
-- --------------------------------------------------------
INSERT INTO departments (name, acronym) VALUES
  ('Computer Science', 'CSC'),
  ('Electrical Engineering', 'EEE'),
  ('Business Administration', 'BUS'),
  ('Mass Communication', 'MAC'),
  ('Accounting', 'ACC'),
  ('Law', 'LAW'),
  ('Medicine and Surgery', 'MED'),
  ('Civil Engineering', 'CVE')
ON CONFLICT (acronym) DO NOTHING;

-- --------------------------------------------------------
-- Insert academic session
-- --------------------------------------------------------
INSERT INTO academic_sessions (session, is_current) VALUES
  ('2024/2025', TRUE)
ON CONFLICT (session) DO NOTHING;

-- --------------------------------------------------------
-- Insert default admin (password: password)
-- Password hash is for 'password' using bcrypt
-- --------------------------------------------------------
INSERT INTO admins (full_name, email, password) VALUES
  ('GSU Super Admin', 'admin@greensparkuni.edu.ng', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm3ycdO')
ON CONFLICT (email) DO NOTHING;
