import { useState, useEffect } from 'react';
import { submitComplaint, getMyComplaints } from '../../services/studentService';

const statusBadge = (status) => {
  const map = { open: 'badge-warning', resolved: 'badge-success' };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [subject,    setSubject]    = useState('');
  const [message,    setMessage]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [selected,   setSelected]   = useState(null);

  const fetchComplaints = () => {
    getMyComplaints()
      .then(res => setComplaints(res.data.complaints || []))
      .catch(() => setError('Failed to load complaints.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return setError('Subject and message are required.');
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const res = await submitComplaint({ subject, message });
      setSuccess(res.data.message || 'Complaint submitted successfully.');
      setSubject(''); setMessage('');
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Complaints</h1>
        <p>Submit and track your complaints to the administration.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Submit form */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>
            New Complaint
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-control" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Brief subject of complaint" required />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Describe your complaint in detail..." rows={6} required />
            </div>
            <button className="btn btn-primary w-full" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        {/* Complaints list */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '16px' }}>
            My Complaints ({complaints.length})
          </h2>
          {loading ? (
            <div className="spinner-wrapper"><div className="spinner"></div></div>
          ) : complaints.length === 0 ? (
            <div className="empty-state"><p>You haven't submitted any complaints yet.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {complaints.map(c => (
                <div key={c.id} className="card" style={{ padding: '16px', cursor: 'pointer' }}
                  onClick={() => setSelected(selected?.id === c.id ? null : c)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '14px' }}>{c.subject}</span>
                    {statusBadge(c.status)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </div>
                  {selected?.id === c.id && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '12px' }}>{c.message}</p>
                      {c.admin_reply && (
                        <div style={{ background: 'var(--card)', borderRadius: 'var(--radius)', padding: '12px',
                          borderLeft: '3px solid var(--royal)' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--royal)', marginBottom: '4px' }}>
                            Admin Reply:
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text)' }}>{c.admin_reply}</p>
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

export default Complaints;