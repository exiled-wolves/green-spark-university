import { useState, useEffect } from 'react';
import { getAllStudents, getStudentById, updateStudentStatus } from '../../services/adminService';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [search,   setSearch]   = useState('');

  const fetchStudents = () => {
    setLoading(true);
    getAllStudents()
      .then(res => setStudents(res.data.students))
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const viewDetail = (id) => {
    getStudentById(id)
      .then(res => setSelected(res.data.student))
      .catch(() => setError('Failed to load student detail.'));
  };

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`${newStatus === 'suspended' ? 'Suspend' : 'Activate'} this student?`)) return;
    try {
      await updateStudentStatus(id, newStatus);
      setMessage(`Student ${newStatus} successfully.`);
      setSelected(null);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.login_id.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>Students</h1>
        <p>View and manage all admitted students.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      <div style={{ marginBottom: '16px' }}>
        <input
          className="form-control"
          placeholder="Search by name, Login ID or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No students found.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Login ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><code style={{ fontSize: '13px', color: 'var(--royal)' }}>{s.login_id}</code></td>
                  <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                  <td>{s.department_name}</td>
                  <td>{s.level}L</td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => viewDetail(s.id)}>
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
                ['Login ID',        selected.login_id],
                ['Email',           selected.email],
                ['Phone',           selected.phone],
                ['Department',      selected.department_name],
                ['Level',           `${selected.level}L`],
                ['Gender',          selected.gender],
                ['State of Origin', selected.state_of_origin],
                ['LGA',             selected.lga],
                ['Status',          selected.status],
                ['Admitted',        new Date(selected.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'grid', gridTemplateColumns: '150px 1fr',
                  padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '14px',
                }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ textTransform: 'capitalize' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                className={`btn btn-sm ${selected.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                onClick={() => toggleStatus(selected.id, selected.status)}
              >
                {selected.status === 'active' ? 'Suspend Student' : 'Activate Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;