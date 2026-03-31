import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data.stats))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const cards = [
    { label: 'Total Students',        value: stats.total_students,        color: '',        path: '/admin/students' },
    { label: 'Total Lecturers',       value: stats.total_lecturers,       color: 'royal',   path: '/admin/lecturers' },
    { label: 'Total Courses',         value: stats.total_courses,         color: 'gold',    path: '/admin/courses' },
    { label: 'Pending Applications',  value: stats.pending_applications,  color: 'danger',  path: '/admin/applications' },
    { label: 'Open Complaints',       value: stats.open_complaints,       color: 'danger',  path: '/admin/complaints' },
    { label: 'Pending Leaves',        value: stats.pending_leaves,        color: 'gold',    path: '/admin/leaves' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back. Here is an overview of Green Spark University.</p>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, color, path }) => (
          <div
            key={label}
            className={`stat-card ${color}`}
            onClick={() => navigate(path)}
            style={{ cursor: 'pointer', transition: 'var(--transition)' }}
          >
            <h3>{label}</h3>
            <div className="stat-value">{value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Review Applications', path: '/admin/applications', color: 'var(--navy)' },
            { label: 'Add Lecturer',         path: '/admin/lecturers',    color: 'var(--royal)' },
            { label: 'Add Course',           path: '/admin/courses',      color: 'var(--royal)' },
            { label: 'Assign Course',        path: '/admin/assignments',  color: 'var(--navy)' },
            { label: 'View Complaints',      path: '/admin/complaints',   color: 'var(--danger)' },
            { label: 'View Leave Requests',  path: '/admin/leaves',       color: 'var(--gold)' },
          ].map(({ label, path, color }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                padding: '14px',
                background: 'var(--bg)',
                border: `1.5px solid ${color}`,
                borderRadius: 'var(--radius)',
                color,
                fontSize: '13px',
                fontWeight: 500,
                textAlign: 'left',
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;