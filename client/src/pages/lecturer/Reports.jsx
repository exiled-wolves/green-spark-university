import { useState, useEffect } from 'react';
import {
  getAssignedCourses,
  getEnrolledStudents,
  reportStudent,
  getMyReports,
} from '../../services/lecturerService';

const statusBadge = (status) => {
  const map = {
    pending: 'badge-warning',
    reviewed: 'badge-success',
  };
  return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
};

const Reports = () => {
  const [tab, setTab] = useState('submit');

  // Submit form state
  const [courses,        setCourses]        = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students,       setStudents]       = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reason,         setReason]         = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);

  // Reports list state
  const [reports,        setReports]        = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [error,   setError]   = useState('');
  const [message, setMessage] = useState('');

  // Fetch courses on mount
  useEffect(() => {
    getAssignedCourses()
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoadingCourses(false));
  }, []);

  // Fetch students when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      setSelectedStudent(null);
      return;
    }

    setLoadingStudents(true);
    getEnrolledStudents(selectedCourse.course_id, {
      session: selectedCourse.session,
      semester: selectedCourse.semester,
    })
      .then(res => setStudents(res.data.students || []))
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoadingStudents(false));
  }, [selectedCourse]);

  // Fetch reports when tab changes
  useEffect(() => {
    if (tab === 'history') {
      setLoadingReports(true);
      getMyReports()
        .then(res => setReports(res.data.reports || []))
        .catch(() => setError('Failed to load reports.'))
        .finally(() => setLoadingReports(false));
    }
  }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudent || !reason.trim()) {
      return setError('Please select a course, student, and provide a reason.');
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await reportStudent({
        student_id: selectedStudent.id,
        course_id: selectedCourse.course_id,
        reason: reason.trim(),
      });
      setMessage(res.data.message || 'Report submitted successfully.');
      setSelectedStudent(null);
      setReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Student Reports</h1>
        <p>Report students for academic misconduct or other issues.</p>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          ['submit', 'Report a Student'],
          ['history', 'My Reports'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-outline'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Submit Report Tab */}
      {tab === 'submit' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
          {/* Form */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>
              Submit Report
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Course</label>
                <select
                  className="form-control"
                  value={selectedCourse?.course_id || ''}
                  onChange={e => {
                    const course = courses.find(c => c.course_id === parseInt(e.target.value));
                    setSelectedCourse(course || null);
                    setSelectedStudent(null);
                  }}
                  required
                >
                  <option value="">-- Select a course --</option>
                  {courses.map(c => (
                    <option key={c.assignment_id} value={c.course_id}>
                      {c.course_code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Student</label>
                {loadingStudents ? (
                  <div style={{ padding: '10px 0', color: 'var(--muted)', fontSize: '14px' }}>
                    Loading students...
                  </div>
                ) : (
                  <select
                    className="form-control"
                    value={selectedStudent?.id || ''}
                    onChange={e => {
                      const student = students.find(s => s.id === parseInt(e.target.value));
                      setSelectedStudent(student || null);
                    }}
                    disabled={!selectedCourse || students.length === 0}
                    required
                  >
                    <option value="">
                      {!selectedCourse
                        ? '-- Select a course first --'
                        : students.length === 0
                        ? '-- No students enrolled --'
                        : '-- Select a student --'}
                    </option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.login_id} — {s.full_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Report</label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Describe the reason for reporting this student..."
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-danger w-full"
                disabled={submitting || !selectedCourse || !selectedStudent}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>

          {/* Selected Student Info */}
          <div>
            {selectedStudent ? (
              <div className="card">
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>
                  Student Details
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold)',
                    fontSize: '24px',
                    fontWeight: 700,
                  }}>
                    {selectedStudent.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--navy)' }}>
                      {selectedStudent.full_name}
                    </div>
                    <span className="badge badge-info">{selectedStudent.login_id}</span>
                  </div>
                </div>

                {[
                  ['Email', selectedStudent.email],
                  ['Phone', selectedStudent.phone],
                  ['Level', selectedStudent.level ? `Level ${selectedStudent.level}` : null],
                  ['Course', `${selectedCourse.course_code} — ${selectedCourse.title}`],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '14px',
                    }}
                  >
                    <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 600 }}>{val || '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="empty-state" style={{ padding: '60px 24px' }}>
                  <p>Select a course and student to see their details here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports History Tab */}
      {tab === 'history' && (
        loadingReports ? (
          <div className="spinner-wrapper"><div className="spinner"></div></div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <p>You haven't filed any student reports yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.student_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{r.student_login_id}</div>
                    </td>
                    <td>
                      <span className="badge badge-navy">{r.course_code}</span>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                        {r.course_title}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontSize: '14px',
                      }}>
                        {r.reason}
                      </div>
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: '13px', color: 'var(--muted)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
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

export default Reports;
