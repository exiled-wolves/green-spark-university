import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard',    label: 'Dashboard' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/students',     label: 'Students' },
  { to: '/admin/lecturers',    label: 'Lecturers' },
  { to: '/admin/courses',      label: 'Courses' },
  { to: '/admin/assignments',  label: 'Assignments' },
  { to: '/admin/complaints',   label: 'Complaints' },
  { to: '/admin/reports',      label: 'Student Reports' },
  { to: '/admin/leaves',       label: 'Leave Requests' },
];

const studentLinks = [
  { to: '/student/dashboard',     label: 'Dashboard' },
  { to: '/student/profile',       label: 'My Profile' },
  { to: '/student/courses',       label: 'Course Registration' },
  { to: '/student/results',       label: 'Results & Grades' },
  { to: '/student/notifications', label: 'Notifications' },
  { to: '/student/complaints',    label: 'Complaints' },
];

const lecturerLinks = [
  { to: '/lecturer/dashboard',  label: 'Dashboard' },
  { to: '/lecturer/profile',    label: 'My Profile' },
  { to: '/lecturer/courses',    label: 'My Courses' },
  { to: '/lecturer/grades',     label: 'Upload Grades' },
  { to: '/lecturer/reports',    label: 'Report Student' },
  { to: '/lecturer/leaves',     label: 'Leave Application' },
  { to: '/lecturer/complaints', label: 'Complaints' },
];

const Sidebar = ({ onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const links = role === 'admin'
    ? adminLinks
    : role === 'student'
    ? studentLinks
    : lecturerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '250px',
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '17px' }}>
          Green Spark
        </div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>
          University Portal
        </div>
      </div>

      {/* User info */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '50%',
          background: 'var(--royal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--white)', fontWeight: 600, fontSize: '16px',
          marginBottom: '10px',
        }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ color: 'var(--white)', fontSize: '14px', fontWeight: 500 }}>
          {user?.full_name}
        </div>
        <span style={{
          display: 'inline-block',
          marginTop: '6px',
          padding: '2px 10px',
          background: 'var(--gold)',
          color: 'var(--navy)',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {role}
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'block',
              padding: '11px 24px',
              fontSize: '14px',
              color: isActive ? 'var(--gold)' : 'rgba(255,255,255,0.75)',
              background: isActive ? 'rgba(201,162,39,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
              transition: 'var(--transition)',
              fontWeight: isActive ? 500 : 400,
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(217,83,79,0.15)',
            color: '#ff8080',
            borderRadius: 'var(--radius)',
            fontSize: '14px',
            fontWeight: 500,
            border: '1px solid rgba(217,83,79,0.3)',
            transition: 'var(--transition)',
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;