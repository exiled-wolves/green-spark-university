import { useState, useEffect } from 'react';
import { getLeaveApplications, updateLeaveStatus } from '../../services/adminService';

const Leaves = () => {
  const [leaves,   setLeaves]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('pending');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [comment,  setComment]  = useState('');

  const fetchLeaves = (status) => {
    setLoading(true);
    getLeaveApplications(status)
      .then(res => setLeaves(res.data.leaves))
      .catch(() => setError('Failed to load leave applications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(filter); }, [filter]);

  const handleDecision = async (status) => {
    setSaving(true);
    try {
      await updateLeaveStatus(selected.id, { status, admin_comment: comment });
      setMessage(`Leave application ${status}.`);
      setSelected(null);
      setComment('');
      fetchLeaves(filter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave.');
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
    return <span className={`badge ${map[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leave Applications</h1>
        <p>Review and respond to lecturer leave requests.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : leaves.length === 0 ? (
        <div className="empty-state"><p>No {filter} leave applications.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Lecturer</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 500 }}>{l.lecturer_name}</td>
                  <td>{l.department_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{l.leave_type}</td>
                  <td>{new Date(l.start_date).toLocaleDateString()}</td>
                  <td>{new Date(l.end_date).toLocaleDateString()}</td>
                  <td>{statusBadge(l.status)}</td>
                  <td>
                    {l.status === 'pending' && (
                      <button className="btn btn-outline btn-sm"
                        onClick={() => { setSelected(l); setComment(''); }}>
                        Review
                      </button>
                    )}
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
              <h2>Leave Request — {selected.lecturer_name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              {[
                ['Leave Type',  selected.leave_type],
                ['Start Date',  new Date(selected.start_date).toLocaleDateString()],
                ['End Date',    new Date(selected.end_date).toLocaleDateString()],
                ['Department',  selected.department_name],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'grid', gridTemplateColumns: '130px 1fr',
                  padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '14px',
                }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ textTransform: 'capitalize' }}>{value}</span>
                </div>
              ))}
              <div style={{
                background: 'var(--bg)', padding: '14px',
                borderRadius: 'var(--radius)', margin: '16px 0', fontSize: '14px', lineHeight: 1.7,
              }}>
                <p style={{ fontWeight: 500, color: 'var(--navy)', marginBottom: '6px' }}>Reason:</p>
                <p>{selected.reason}</p>
              </div>
              <div className="form-group">
                <label className="form-label">Admin Comment (optional)</label>
                <textarea className="form-control" rows={3}
                  value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment for the lecturer..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm"
                onClick={() => handleDecision('rejected')} disabled={saving}>
                Reject
              </button>
              <button className="btn btn-success btn-sm"
                onClick={() => handleDecision('approved')} disabled={saving}>
                {saving ? 'Saving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;