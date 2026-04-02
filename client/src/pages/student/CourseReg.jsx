import { useState, useEffect } from 'react';
import {
  getAvailableCourses,
  getRegisteredCourses,
  registerCourse,
  dropCourse,
} from '../../services/studentService';

const CourseReg = () => {
  const [available,   setAvailable]   = useState([]);
  const [registered,  setRegistered]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [actionId,    setActionId]    = useState(null);
  const [error,       setError]       = useState('');
  const [message,     setMessage]     = useState('');
  const [tab,         setTab]         = useState('available');
  const [semFilter,   setSemFilter]   = useState('');

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getAvailableCourses(), getRegisteredCourses()])
      .then(([aRes, rRes]) => {
        console.log('[v0] Available courses response:', aRes.data);
        console.log('[v0] Registered courses response:', rRes.data);
        setAvailable(aRes.data.courses || []);
        setRegistered(rRes.data.courses || []);
      })
      .catch((err) => {
        console.log('[v0] Course fetch error:', err.response?.data || err.message);
        setError('Failed to load courses.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const registeredIds = new Set(registered.map(c => c.id));

  const handleRegister = async (course_id) => {
    setActionId(course_id);
    setError(''); setMessage('');
    try {
      const res = await registerCourse(course_id);
      setMessage(res.data.message || 'Course registered successfully.');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register course.');
    } finally {
      setActionId(null);
    }
  };

  const handleDrop = async (course_id) => {
    if (!window.confirm('Drop this course?')) return;
    setActionId(course_id);
    setError(''); setMessage('');
    try {
      const res = await dropCourse(course_id);
      setMessage(res.data.message || 'Course dropped.');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to drop course.');
    } finally {
      setActionId(null);
    }
  };

  const semesters = [...new Set(available.map(c => c.semester))];
  const filtered = semFilter ? available.filter(c => c.semester === semFilter) : available;

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Course Registration</h1>
        <p>Browse and register courses for the current semester.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[['available', 'Available Courses'], ['registered', `Registered (${registered.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-outline'}`}>{label}</button>
        ))}
      </div>

      {tab === 'available' && (
        <>
          {semesters.length > 1 && (
            <div style={{ marginBottom: '16px' }}>
              <select className="form-control" style={{ width: '200px' }} value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                <option value="">All Semesters</option>
                {semesters.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
              </select>
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="empty-state"><p>No courses available for registration at this time.</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Name</th>
                    <th>Units</th>
                    <th>Semester</th>
                    <th>Level</th>
                    <th>Lecturer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const isReg = registeredIds.has(c.id);
                    return (
                      <tr key={c.id}>
                        <td><span className="badge badge-navy">{c.course_code}</span></td>
                        <td>{c.course_name || c.title}</td>
                        <td>{c.credit_units}</td>
                        <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                        <td>{c.level}</td>
                        <td>{c.lecturer_name || '—'}</td>
                        <td>
                          {isReg ? (
                            <span className="badge badge-success">Registered</span>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={actionId === c.id}
                              onClick={() => handleRegister(c.id)}
                            >
                              {actionId === c.id ? '...' : 'Register'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'registered' && (
        registered.length === 0 ? (
          <div className="empty-state"><p>You haven't registered any courses yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Units</th>
                  <th>Semester</th>
                  <th>Level</th>
                  <th>Lecturer</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registered.map(c => (
                  <tr key={c.id}>
                    <td><span className="badge badge-navy">{c.course_code}</span></td>
                    <td>{c.course_name || c.title}</td>
                    <td>{c.credit_units}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                    <td>{c.level}</td>
                    <td>{c.lecturer_name || '—'}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={actionId === c.id}
                        onClick={() => handleDrop(c.id)}
                      >
                        {actionId === c.id ? '...' : 'Drop'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default CourseReg;
