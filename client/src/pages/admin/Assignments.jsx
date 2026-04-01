import { useState, useEffect } from 'react';
import { getAllAssignments, assignCourse, getAllCourses, getAllLecturers } from '../../services/adminService';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [lecturers,   setLecturers]   = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [message,     setMessage]     = useState('');

  const [form, setForm] = useState({
    course_id: '', lecturer_id: '', session: '2024/2025', semester: '',
  });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      getAllAssignments(),
      getAllCourses(),
      getAllLecturers(),
    ]).then(([a, c, l]) => {
      setAssignments(a.data.assignments);
      setCourses(c.data.courses);
      setLecturers(l.data.lecturers);
    }).catch(() => setError('Failed to load data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course_id || !form.lecturer_id || !form.session || !form.semester) {
      return setError('All fields are required.');
    }
    setSaving(true);
    try {
      await assignCourse(form);
      setMessage('Course assigned successfully.');
      setShowModal(false);
      setForm({ course_id: '', lecturer_id: '', session: '2024/2025', semester: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Course Assignments</h1>
          <p>Assign courses to lecturers per session and semester.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Assign Course
        </button>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : assignments.length === 0 ? (
        <div className="empty-state"><p>No assignments found.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Lecturer</th>
                <th>Department</th>
                <th>Level</th>
                <th>Session</th>
                <th>Semester</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td><code style={{ color: 'var(--royal)', fontSize: '13px' }}>{a.course_code}</code></td>
                  <td style={{ fontWeight: 500 }}>{a.course_title}</td>
                  <td>{a.lecturer_name}</td>
                  <td>{a.department_name}</td>
                  <td>{a.level}L</td>
                  <td>{a.session}</td>
                  <td style={{ textTransform: 'capitalize' }}>{a.semester}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Course to Lecturer</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select name="course_id" className="form-control"
                    value={form.course_id} onChange={handleChange}>
                    <option value="">Select course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.course_code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lecturer <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select name="lecturer_id" className="form-control"
                    value={form.lecturer_id} onChange={handleChange}>
                    <option value="">Select lecturer</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.full_name} — {l.department_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div className="form-group">
                    <label className="form-label">Session <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="session" className="form-control" placeholder="e.g. 2024/2025"
                      value={form.session} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="semester" className="form-control"
                      value={form.semester} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="first">First</option>
                      <option value="second">Second</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Assigning...' : 'Assign Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;