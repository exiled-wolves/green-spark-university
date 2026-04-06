-- Force delete and recreate the admin user with password "password"
-- Hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm3ycdO

DELETE FROM admins WHERE email = 'admin@greensparkuni.edu.ng';

INSERT INTO admins (full_name, email, password) VALUES
  ('GSU Super Admin', 'admin@greensparkuni.edu.ng', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm3ycdO');

-- Verify it was inserted
SELECT id, full_name, email FROM admins WHERE email = 'admin@greensparkuni.edu.ng';
