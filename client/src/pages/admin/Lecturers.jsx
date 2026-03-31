import { useState, useEffect } from 'react';
import {
  getAllLecturers, getLecturerById,
  addLecturer, updateLecturerStatus,
} from '../../services/adminService';
import { getDepartments } from '../../services/applicantService';

const Lecturers = () => {
  const [lecturers,    setLecturers]    = useState([]);
  const [departments,  setDepartments]  = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [message,      setMessage]      = useState('');
  const [search,       setSearch]       = useState('');

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '',
    department_id: '', qualification: '',
  });

  const fetchLecturers = () => {
    setLoading(true);
    getAllLecturers()
      .then(res => setLecturers(res.data.lecturers))
      .catch(() => setError('Failed to load lecturers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLecturers();
    getDepartments().then(res => setDepartments(res.data.departments)).catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.department_id) {
      return setError('Full name, email, phone and department are required.');
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v); });
      const res = await addLecturer(data);
      setMessage(`${res.data.message} — Default password: 1234`);
      setShowModal(false);
      setForm({ full_name: '', email: '', phone: '', department_id: '', qualification: '' });
      fetchLecturers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecturer.');
    } finally {
      setSaving(false);
    }
  };

  const viewDetail = id => {
    getLecturerById(id)
      .then(res => setSelected(res.data.lecturer))
      .catch(() => setError('Failed to load lecturer.'));
  };

  const toggleStatus = async (id, current) => {
    const newStatus = current === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`${newStatus === 'suspended' ? 'Suspend' : 'Activate'} this lecturer?`)) return;
    try {
      await updateLecturerStatus(id, newStatus);
      setMessage(`Lecturer ${newStatus} successfully.`);
      setSelected(null);
      fetchLecturers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filtered = lecturers.filter(l =>
    l.full_name.toLowerCase().includes(search.toLowerCase()) ||
    l.login_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Lecturers</h1>
          <p>Manage all lecturer accounts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Lecturer
        </button>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      <div style={{ marginBottom: '16px' }}>
        <input className="form-control" placeholder="Search by name or Login ID..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '400px' }} />
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No lecturers found.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Login ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td><code style={{ fontSize: '13px', color: 'var(--royal)' }}>{l.login_id}</code></td>
                  <td style={{ fontWeight: 500 }}>{l.full_name}</td>
                  <td>{l.department_name}</td>
                  <td>{l.phone}</td>
                  <td>
                    <span className={`badge ${l.status === 'active' ? 'badge-success' : l.status === 'on_leave' ? 'badge-warning' : 'badge-danger'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => viewDetail(l.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add lecturer modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Lecturer</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body">
                {[
                  { name: 'full_name',     label: 'Full Name',      type: 'text',  required: true },
                  { name: 'email',         label: 'Email',          type: 'email', required: true },
                  { name: 'phone',         label: 'Phone',          type: 'text',  required: true },
                  { name: 'qualification', label: 'Qualification',  type: 'text',  required: false },
                ].map(({ name, label, type, required }) => (
                  <div className="form-group" key={name}>
                    <label className="form-label">
                      {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
                    </label>
                    <input type={type} name={name} className="form-control"
                      value={form[name]} onChange={handleChange} />
                  </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select name="department_id" className="form-control"
                    value={form.department_id} onChange={handleChange}>
                    <option value="">Select department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="alert alert-info" style={{ marginTop: '8px' }}>
                  Default password will be <strong>1234</strong>. The lecturer must change it on first login.
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Adding...' : 'Add Lecturer'}
                </button>
              </div>
            </form>
          </div>
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
                ['Login ID',      selected.login_id],
                ['Email',         selected.email],
                ['Phone',         selected.phone],
                ['Department',    selected.department_name],
                ['Qualification', selected.qualification],
                ['Status',        selected.status],
                ['Added',         new Date(selected.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'grid', gridTemplateColumns: '140px 1fr',
                  padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: '14px',
                }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                  <span>{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                className={`btn btn-sm ${selected.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                onClick={() => toggleStatus(selected.id, selected.status)}
              >
                {selected.status === 'active' ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lecturers;