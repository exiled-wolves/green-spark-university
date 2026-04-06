-- Verify admin user exists and check data
SELECT 'Checking admins table...' as check_type;
SELECT COUNT(*) as admin_count FROM admins;
SELECT id, full_name, email FROM admins LIMIT 5;

SELECT '' as separator;
SELECT 'Checking departments...' as check_type;
SELECT COUNT(*) as department_count FROM departments;

SELECT '' as separator;
SELECT 'Checking academic_sessions...' as check_type;
SELECT COUNT(*) as session_count FROM academic_sessions;
SELECT * FROM academic_sessions;
