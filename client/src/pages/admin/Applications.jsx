import { useState, useEffect } from 'react';
import {
  getApplications, getApplicationById,
  acceptApplication, rejectApplication,
} from '../../services/adminService';

const statusBadge = (status) => {
  const map = { pending: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger' };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [filter,       setFilter]       = useState('pending');
  const [loading,      setLoading]      = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,        setError]        = useState('');
  const [message,      setMessage]      = useState('');

  const fetchApplications = (status) => {
    setLoading(true);
    getApplications(status)
      .then(res => setApplications(res.data.applicants))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(filter); }, [filter]);

  const viewDetail = (id) => {
    getApplicationById(id)
      .then(res => setSelected(res.data.applicant))
      .catch(() => setError('Failed to load application detail.'));
  };

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this application and send admission email?')) return;
    setActionLoading(true);
    try {
      const res = await acceptApplication(id);
      setMessage(res.data.message);
      setSelected(null);
      fetchApplications(filter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this application? A rejection email will be sent.')) return;
    setActionLoading(true);
    try {
      const res = await rejectApplication(id);
      setMessage(res.data.message);
      setSelected(null);
      fetchApplications(filter);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Admission Applications</h1>
        <p>Review, accept or reject applicant submissions.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['pending', 'accepted', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : applications.length === 0 ? (
        <div className="empty-state"><p>No {filter} applications found.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>JAMB Score</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 500 }}>{app.full_name}</td>
                  <td>{app.email}</td>
                  <td>{app.department_name}</td>
                  <td>{app.jamb_score}</td>
                  <td>{statusBadge(app.status)}</td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => viewDetail(app.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.full_name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              {[
                ['Email',           selected.email],
                ['Phone',           selected.phone],
                ['Department',      selected.department_name],
                ['Gender',          selected.gender],
                ['Date of Birth',   selected.date_of_birth],
                ['State of Origin', selected.state_of_origin],
                ['LGA',             selected.lga],
                ['JAMB Reg No.',    selected.jamb_reg_number],
                ['JAMB Score',      selected.jamb_score],
                ['Next of Kin',     selected.next_of_kin_name],
                ['NOK Phone',       selected.next_of_kin_phone],
                ['NOK Relation',    selected.next_of_kin_relation],
                ['Address',         selected.residential_address],
                ['Status',          selected.status],
                ['Applied',         new Date(selected.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'grid', gridTemplateColumns: '150px 1fr',
                  padding: '9px 0', borderBottom: '1px solid var(--border)',
                  fontSize: '14px',
                }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ textTransform: label === 'Status' ? 'capitalize' : 'none' }}>
                    {value || '—'}
                  </span>
                </div>
              ))}

              {/* O'level results */}
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '10px', fontSize: '14px' }}>
                  O'Level Results
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(typeof selected.olevel_results === 'string'
                    ? JSON.parse(selected.olevel_results)
                    : selected.olevel_results
                  ).map((r, i) => (
                    <span key={i} className="badge badge-info">
                      {r.subject}: {r.grade}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {selected.status === 'pending' && (
              <div className="modal-footer">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleReject(selected.id)}
                  disabled={actionLoading}
                >
                  Reject
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleAccept(selected.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Processing...' : 'Accept & Admit'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;