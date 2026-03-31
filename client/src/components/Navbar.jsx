import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/studentService';

const Navbar = ({ onMenuClick }) => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (role === 'student') {
      getNotifications()
        .then(res => setUnread(res.data.unread_count || 0))
        .catch(() => {});
    }
  }, [role]);

  const getDashboardPath = () => {
    if (role === 'admin')    return '/admin/dashboard';
    if (role === 'student')  return '/student/dashboard';
    if (role === 'lecturer') return '/lecturer/dashboard';
    return '/';
  };

  return (
    <header style={{
      height: '64px',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 4px rgba(10,31,68,0.06)',
    }}>
      {/* Left */}
      <span
        onClick={() => navigate(getDashboardPath())}
        style={{
          fontWeight: 700, fontSize: '16px',
          color: 'var(--navy)', cursor: 'pointer',
        }}
      >
        GSU Portal
      </span>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Notification bell — students only (Rule 4) */}
        {role === 'student' && (
          <button
            onClick={() => navigate('/student/notifications')}
            style={{ position: 'relative', background: 'none', fontSize: '20px', color: 'var(--navy)' }}
          >
            🔔
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-6px',
                background: 'var(--danger)', color: 'var(--white)',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '10px', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 600,
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        )}

        {/* User avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gold)', fontWeight: 700, fontSize: '14px',
          }}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>
              {user?.full_name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' }}>
              {role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;