import { useState, useEffect } from 'react';
import { getAllCourses, addCourse, updateCourse } from '../../services/adminService';
import { getDepartments } from '../../services/applicantService';

const Courses = () => {
  const [courses,     setCourses]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [message,     setMessage]     = useState('');
  const [search,      setSearch]      = useState('');

  const [form, setForm] = useState({
    course_code: '', title: '', description: '',
    credit_units: 2, department_id: '', level: '', semester: '',
  });

  const fetchCourses = () => {
    setLoading(true);
    getAllCourses()
      .then(res => setCourses(res.data.courses))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    getDepartments().then(res => setDepartments(res.data.departments)).catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditing(null);
    setForm({ course_code: '', title: '', description: '', credit_units: 2, department_id: '', level: '', semester: '' });
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      course_code:  course.course_code,
      title:        course.title,
      description:  course.description || '',
      credit_units: course.credit_units,
      department_id:course.department_id,
      level:        course.level,
      semester:     course.semester,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.course_code || !form.title || !form.department_id || !form.level || !form.semester) {
      return setError('All required fields must be filled.');
    }
    setSaving(true);
    try {
      if (editing) {
        await updateCourse(editing.id, { title: form.title, description: form.description, credit_units: form.credit_units });
        setMessage('Course updated successfully.');
      } else {
        await addCourse(form);
        setMessage('Course added successfully.');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = courses.filter(c =>
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1>Courses</h1>
          <p>Manage all courses — {courses.length} total registered.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      <div style={{ marginBottom: '16px' }}>
        <input className="form-control" placeholder="Search by code or title..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '400px' }} />
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No courses found.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Department</th>
                <th>Level</th>
                <th>Semester</th>
                <th>Units</th>
                <th>Students</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td><code style={{ color: 'var(--royal)', fontSize: '13px' }}>{c.course_code}</code></td>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td>{c.department_name}</td>
                  <td>{c.level}L</td>
                  <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                  <td>{c.credit_units}</td>
                  <td>{c.total_registered_students}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Course' : 'Add New Course'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Course Code <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input name="course_code" className="form-control" placeholder="e.g. CSC301"
                    value={form.course_code} onChange={handleChange} disabled={!!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Title <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input name="title" className="form-control"
                    value={form.title} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-control" rows={3}
                    value={form.description} onChange={handleChange} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div className="form-group">
                    <label className="form-label">Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="department_id" className="form-control"
                      value={form.department_id} onChange={handleChange} disabled={!!editing}>
                      <option value="">Select</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Level <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="level" className="form-control"
                      value={form.level} onChange={handleChange} disabled={!!editing}>
                      <option value="">Select</option>
                      {[100,200,300,400,500].map(l => <option key={l} value={l}>{l}L</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="semester" className="form-control"
                      value={form.semester} onChange={handleChange} disabled={!!editing}>
                      <option value="">Select</option>
                      <option value="first">First</option>
                      <option value="second">Second</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credit Units</label>
                    <input type="number" name="credit_units" className="form-control"
                      min={1} max={6} value={form.credit_units} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Course' : 'Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;