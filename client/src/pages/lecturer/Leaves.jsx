import { useState, useEffect } from 'react';
import { applyForLeave, getMyLeaves } from '../../services/lecturerService';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'study', label: 'Study Leave' },
  { value: 'other', label: 'Other' },
];

const statusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
  };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

const typeBadge = (type) => {
  const map = {
    annual: 'badge-info',
    sick: 'badge-danger',
    maternity: 'badge-gold',
    study: 'badge-navy',
    other: 'badge-info',
  };
  return (
    <span className={`badge ${map[type] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
      {type}
    </span>
  );
};

const Leaves = () => {
  const [leaves,     setLeaves]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [message,    setMessage]    = useState('');
  const [selected,   setSelected]   = useState(null);

  // Form state
  const [form, setForm] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const fetchLeaves = () => {
    setLoading(true);
    getMyLeaves()
      .then(res => {
        console.log('[v0] Lecturer my leaves response:', res.data);
        setLeaves(res.data.leaves || []);
      })
      .catch((err) => {
        console.log('[v0] Lecturer leaves error:', err.response?.data || err.message);
        setError('Failed to load leave applications.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leave_type || !form.start_date || !form.end_date || !form.reason.trim()) {
      return setError('All fields are required.');
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      return setError('End date must be after start date.');
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      console.log('[v0] Submitting leave application with data:', form);
      const res = await applyForLeave(form);
      console.log('[v0] Leave submission response:', res.data);
      setMessage(res.data.message || 'Leave application submitted successfully.');
      setForm({ leave_type: '', start_date: '', end_date: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      console.log('[v0] Leave submission error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPending = leaves.some(l => l.status === 'pending');

  return (
    <div>
      <div className="page-header">
        <h1>Leave Application</h1>
        <p>Apply for leave and view your application history.</p>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <h3>Total Applications</h3>
          <div className="stat-value">{leaves.length}</div>
        </div>
        <div className="stat-card gold">
          <h3>Pending</h3>
          <div className="stat-value">{leaves.filter(l => l.status === 'pending').length}</div>
        </div>
        <div className="stat-card success">
          <h3>Approved</h3>
          <div className="stat-value">{leaves.filter(l => l.status === 'approved').length}</div>
        </div>
        <div className="stat-card danger">
          <h3>Rejected</h3>
          <div className="stat-value">{leaves.filter(l => l.status === 'rejected').length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Application Form */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>
            New Application
          </h2>

          {hasPending && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              You have a pending leave application. Please wait for admin review before submitting another.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                className="form-control"
                value={form.leave_type}
                onChange={e => handleChange('leave_type', e.target.value)}
                disabled={hasPending}
                required
              >
                <option value="">-- Select leave type --</option>
                {leaveTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.start_date}
                  onChange={e => handleChange('start_date', e.target.value)}
                  disabled={hasPending}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.end_date}
                  onChange={e => handleChange('end_date', e.target.value)}
                  disabled={hasPending}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea
                className="form-control"
                rows={4}
                value={form.reason}
                onChange={e => handleChange('reason', e.target.value)}
                placeholder="Explain the reason for your leave request..."
                disabled={hasPending}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || hasPending}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* Leave History */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '16px' }}>
            Application History ({leaves.length})
          </h2>

          {loading ? (
            <div className="spinner-wrapper"><div className="spinner"></div></div>
          ) : leaves.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <p>No leave applications yet.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.map(l => (
                <div
                  key={l.id}
                  className="card"
                  style={{ padding: '16px', cursor: 'pointer' }}
                  onClick={() => setSelected(selected?.id === l.id ? null : l)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {typeBadge(l.leave_type)}
                      {statusBadge(l.status)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {new Date(l.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', color: 'var(--navy)', fontWeight: 500 }}>
                    {new Date(l.start_date).toLocaleDateString()} — {new Date(l.end_date).toLocaleDateString()}
                  </div>

                  {selected?.id === l.id && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)', marginBottom: '4px' }}>
                          Reason
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>
                          {l.reason}
                        </p>
                      </div>

                      {l.admin_comment && (
                        <div style={{
                          background: l.status === 'approved' ? '#d4edda' : l.status === 'rejected' ? '#f8d7da' : 'var(--card)',
                          borderRadius: 'var(--radius)',
                          padding: '12px',
                          borderLeft: `3px solid ${l.status === 'approved' ? 'var(--success)' : l.status === 'rejected' ? 'var(--danger)' : 'var(--royal)'}`,
                        }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: l.status === 'approved' ? '#155724' : l.status === 'rejected' ? '#721c24' : 'var(--royal)',
                            marginBottom: '4px',
                          }}>
                            Admin Comment:
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text)' }}>{l.admin_comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaves;
