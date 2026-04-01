import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getProfile,
  getRegisteredCourses,
  getResults,
  getNotifications,
} from '../../services/studentService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [results,  setResults]  = useState([]);
  const [unread,   setUnread]   = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    Promise.all([
      getProfile(),
      getRegisteredCourses(),
      getResults(),
      getNotifications(),
    ])
      .then(([pRes, cRes, rRes, nRes]) => {
        setProfile(pRes.data.student);
        setCourses(cRes.data.courses || []);
        setResults(rRes.data.results || []);
        setUnread(nRes.data.unread_count || 0);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const passed = results.filter(r => r.grade !== 'F').length;
  const failed = results.filter(r => r.grade === 'F').length;

  const quickLinks = [
    { label: 'Register Courses',   path: '/student/courses',       color: 'var(--navy)' },
    { label: 'View Results',       path: '/student/results',       color: 'var(--royal)' },
    { label: 'My Profile',         path: '/student/profile',       color: 'var(--royal)' },
    { label: 'Submit a Complaint', path: '/student/complaints',    color: 'var(--danger)' },
    { label: 'Notifications',      path: '/student/notifications', color: 'var(--gold)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p>Here's an overview of your academic portal.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>Registered Courses</h3><div className="stat-value">{courses.length}</div></div>
        <div className="stat-card royal"><h3>Results Available</h3><div className="stat-value">{results.length}</div></div>
        <div className="stat-card success"><h3>Courses Passed</h3><div className="stat-value">{passed}</div></div>
        <div className="stat-card danger"><h3>Courses Failed</h3><div className="stat-value">{failed}</div></div>
        <div className="stat-card gold"><h3>Unread Notifications</h3><div className="stat-value">{unread}</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>My Information</h2>
          {[
            ['Login ID',   profile?.login_id],
            ['Department', profile?.department_name],
            ['Level',      profile?.level ? profile.level + ' Level' : '—'],
            ['Status',     profile?.status],
            ['Session',    profile?.current_session || '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--navy)', fontWeight: 600, textTransform: 'capitalize' }}>{val || '—'}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quickLinks.map(({ label, path, color }) => (
              <button key={label} onClick={() => navigate(path)} style={{
                padding: '12px 16px', background: 'var(--bg)',
                border: '1.5px solid ' + color, borderRadius: 'var(--radius)',
                color, fontSize: '14px', fontWeight: 500, textAlign: 'left', transition: 'var(--transition)',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)' }}>Registered Courses</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/courses')}>View All</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Course Code</th><th>Course Name</th><th>Semester</th><th>Units</th></tr></thead>
              <tbody>
                {courses.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td><span className="badge badge-navy">{c.course_code}</span></td>
                    <td>{c.course_name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                    <td>{c.credit_units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;