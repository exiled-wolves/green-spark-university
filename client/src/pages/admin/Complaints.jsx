import { useState, useEffect } from 'react';
import { getComplaints, replyComplaint } from '../../services/adminService';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState('open');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [message,    setMessage]    = useState('');
  const [reply,      setReply]      = useState('');

  const fetchComplaints = (status) => {
    setLoading(true);
    getComplaints(status)
      .then(res => setComplaints(res.data.complaints))
      .catch(() => setError('Failed to load complaints.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(filter); }, [filter]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return setError('Reply cannot be empty.');
    setSaving(true);
    try {
      await replyComplaint(selected.id, { admin_reply: reply, status: 'resolved' });
      setMessage('Reply sent and complaint resolved.');
      setSelected(null);
      setReply('');
      fetchComplaints(filter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const map = { open: 'badge-danger', reviewed: 'badge-warning', resolved: 'badge-success' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Complaints</h1>
        <p>Review and respond to complaints from students and lecturers.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['open', 'reviewed', 'resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : complaints.length === 0 ? (
        <div className="empty-state"><p>No {filter} complaints.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                      {c.sender_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.subject}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => {
                      setSelected(c); setReply('');
                    }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.subject}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'var(--bg)', padding: '14px', borderRadius: 'var(--radius)',
                marginBottom: '16px', fontSize: '14px', lineHeight: 1.7,
              }}>
                {selected.message}
              </div>
              {selected.admin_reply && (
                <div style={{
                  background: 'var(--card)', padding: '14px',
                  borderRadius: 'var(--radius)', borderLeft: '4px solid var(--navy)',
                  marginBottom: '16px', fontSize: '14px',
                }}>
                  <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '6px' }}>
                    Admin Reply:
                  </p>
                  <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>{selected.admin_reply}</p>
                </div>
              )}
              {selected.status !== 'resolved' && (
                <form onSubmit={handleReply}>
                  <div className="form-group">
                    <label className="form-label">Your Reply</label>
                    <textarea className="form-control" rows={4}
                      value={reply} onChange={e => setReply(e.target.value)}
                      placeholder="Type your response..." />
                  </div>
                  <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                    {saving ? 'Sending...' : 'Send Reply & Resolve'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;