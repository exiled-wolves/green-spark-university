import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getAssignedCourses, getMyLeaves } from '../../services/lecturerService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile,  setProfile]  = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [leaves,   setLeaves]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    Promise.all([getProfile(), getAssignedCourses(), getMyLeaves()])
      .then(([pRes, cRes, lRes]) => {
        setProfile(pRes.data.lecturer);
        setCourses(cRes.data.courses || []);
        setLeaves(lRes.data.leaves || []);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const pendingLeave = leaves.filter(l => l.status === 'pending').length;

  const quickLinks = [
    { label: 'My Courses',        path: '/lecturer/courses',    color: 'var(--navy)' },
    { label: 'Upload Grades',     path: '/lecturer/grades',     color: 'var(--royal)' },
    { label: 'Report a Student',  path: '/lecturer/reports',    color: 'var(--danger)' },
    { label: 'Apply for Leave',   path: '/lecturer/leaves',     color: 'var(--gold)' },
    { label: 'Submit Complaint',  path: '/lecturer/complaints', color: 'var(--muted)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {profile?.full_name?.split(' ')[0]} 👋</h1>
        <p>Here's your lecturer portal overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>Assigned Courses</h3><div className="stat-value">{courses.length}</div></div>
        <div className="stat-card royal"><h3>Leave Applications</h3><div className="stat-value">{leaves.length}</div></div>
        <div className="stat-card gold"><h3>Pending Leaves</h3><div className="stat-value">{pendingLeave}</div></div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--muted)' }}>
          <h3>Status</h3>
          <div style={{ marginTop: '8px' }}>
            <span className={`badge ${profile?.status === 'active' ? 'badge-success' : 'badge-warning'}`}
              style={{ fontSize: '16px', padding: '6px 14px' }}>
              {profile?.status || '—'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile summary */}
        <div className="card">
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>My Information</h2>
          {[
            ['Login ID',    profile?.login_id],
            ['Department',  profile?.department_name],
            ['Email',       profile?.email],
            ['Phone',       profile?.phone],
            ['Status',      profile?.status],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ color: 'var(--navy)', fontWeight: 600, textTransform: 'capitalize' }}>{val || '—'}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
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

      {/* Assigned courses preview */}
      {courses.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)' }}>My Assigned Courses</h2>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/lecturer/courses')}>View All</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Code</th><th>Course Name</th><th>Level</th><th>Semester</th><th>Session</th></tr></thead>
              <tbody>
                {courses.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td><span className="badge badge-navy">{c.course_code}</span></td>
                    <td>{c.course_name}</td>
                    <td>{c.level}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                    <td>{c.session}</td>
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