import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignedCourses, getEnrolledStudents } from '../../services/lecturerService';

const Courses = () => {
  const navigate = useNavigate();
  const [courses,      setCourses]      = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students,     setStudents]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error,        setError]        = useState('');
  const [session,      setSession]      = useState('');
  const [semFilter,    setSemFilter]    = useState('');

  useEffect(() => {
    getAssignedCourses()
      .then(res => {
        setCourses(res.data.courses || []);
        setSession(res.data.session || '');
      })
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  const handleViewStudents = async (course) => {
    setSelectedCourse(course);
    setLoadingStudents(true);
    setStudents([]);
    try {
      const res = await getEnrolledStudents(course.course_id, {
        session: course.session,
        semester: course.semester,
      });
      setStudents(res.data.students || []);
    } catch {
      setError('Failed to load enrolled students.');
    } finally {
      setLoadingStudents(false);
    }
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setStudents([]);
  };

  const semesters = [...new Set(courses.map(c => c.semester))];
  const filtered = semFilter ? courses.filter(c => c.semester === semFilter) : courses;

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Assigned Courses</h1>
        <p>View courses assigned to you for the current academic session ({session || 'N/A'}).</p>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}

      {courses.length === 0 ? (
        <div className="empty-state">
          <p>You have no courses assigned for this session.</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <h3>Total Courses</h3>
              <div className="stat-value">{courses.length}</div>
            </div>
            <div className="stat-card royal">
              <h3>Total Enrolled Students</h3>
              <div className="stat-value">{courses.reduce((sum, c) => sum + (c.enrolled_students || 0), 0)}</div>
            </div>
            <div className="stat-card gold">
              <h3>Current Session</h3>
              <div className="stat-value" style={{ fontSize: '20px' }}>{session || 'N/A'}</div>
            </div>
          </div>

          {/* Filter */}
          {semesters.length > 1 && (
            <div style={{ marginBottom: '16px' }}>
              <select
                className="form-control"
                style={{ width: '200px' }}
                value={semFilter}
                onChange={e => setSemFilter(e.target.value)}
              >
                <option value="">All Semesters</option>
                {semesters.map(s => (
                  <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Courses Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Level</th>
                  <th>Semester</th>
                  <th>Units</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.assignment_id}>
                    <td><span className="badge badge-navy">{c.course_code}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td>{c.level}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.semester}</td>
                    <td>{c.credit_units}</td>
                    <td>
                      <span className={`badge ${c.enrolled_students > 0 ? 'badge-success' : 'badge-warning'}`}>
                        {c.enrolled_students} student{c.enrolled_students !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleViewStudents(c)}
                      >
                        View Students
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/lecturer/grades', {
                          state: { course: c }
                        })}
                      >
                        Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Students Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedCourse.course_code} — {selectedCourse.title}
              </h2>
              <button className="modal-close" onClick={closeModal}>x</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-navy">Level {selectedCourse.level}</span>
                <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                  {selectedCourse.semester} Semester
                </span>
                <span className="badge badge-info">{selectedCourse.session}</span>
              </div>

              {loadingStudents ? (
                <div className="spinner-wrapper" style={{ minHeight: '100px' }}>
                  <div className="spinner"></div>
                </div>
              ) : students.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <p>No students enrolled in this course yet.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Login ID</th>
                        <th>Student Name</th>
                        <th>Level</th>
                        <th>CA</th>
                        <th>Exam</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id}>
                          <td><span className="badge badge-info">{s.login_id}</span></td>
                          <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                          <td>{s.level}</td>
                          <td>{s.ca_score ?? '—'}</td>
                          <td>{s.exam_score ?? '—'}</td>
                          <td>
                            {s.grade ? (
                              <span className={`badge ${s.grade === 'F' ? 'badge-danger' : 'badge-success'}`}>
                                {s.grade}
                              </span>
                            ) : (
                              <span className="badge badge-warning">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  closeModal();
                  navigate('/lecturer/grades', { state: { course: selectedCourse } });
                }}
              >
                Upload Grades
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
