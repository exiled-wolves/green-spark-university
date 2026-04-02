import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getAssignedCourses,
  getEnrolledStudents,
  uploadResult,
  uploadBulkResults,
} from '../../services/lecturerService';

const GradeUpload = () => {
  const location = useLocation();
  const passedCourse = location.state?.course || null;

  const [courses,        setCourses]        = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(passedCourse);
  const [students,       setStudents]       = useState([]);
  const [grades,         setGrades]         = useState({});
  const [loading,        setLoading]        = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [savingId,       setSavingId]       = useState(null);
  const [error,          setError]          = useState('');
  const [message,        setMessage]        = useState('');
  const [session,        setSession]        = useState('');

  // Fetch courses on mount
  useEffect(() => {
    getAssignedCourses()
      .then(res => {
        setCourses(res.data.courses || []);
        setSession(res.data.session || '');
      })
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  // Fetch students when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setStudents([]);
      setGrades({});
      return;
    }

    setLoadingStudents(true);
    setStudents([]);
    setGrades({});

    getEnrolledStudents(selectedCourse.course_id, {
      session: selectedCourse.session,
      semester: selectedCourse.semester,
    })
      .then(res => {
        const studentList = res.data.students || [];
        setStudents(studentList);
        // Initialize grades state with existing scores
        const initialGrades = {};
        studentList.forEach(s => {
          initialGrades[s.id] = {
            ca_score: s.ca_score ?? '',
            exam_score: s.exam_score ?? '',
          };
        });
        setGrades(initialGrades);
      })
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoadingStudents(false));
  }, [selectedCourse]);

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Upload single result
  const handleSaveSingle = async (student) => {
    const studentGrades = grades[student.id];
    if (!studentGrades?.ca_score && !studentGrades?.exam_score) {
      return setError('Please enter at least CA or Exam score.');
    }

    setSavingId(student.id);
    setError('');
    setMessage('');

    try {
      const res = await uploadResult({
        student_id: student.id,
        course_id: selectedCourse.course_id,
        session: selectedCourse.session,
        semester: selectedCourse.semester,
        ca_score: studentGrades.ca_score || null,
        exam_score: studentGrades.exam_score || null,
      });

      setMessage(`Result saved for ${student.full_name}. Grade: ${res.data.result.grade}`);

      // Update student's grade in the UI
      setStudents(prev =>
        prev.map(s =>
          s.id === student.id
            ? {
                ...s,
                ca_score: res.data.result.ca_score,
                exam_score: res.data.result.exam_score,
                total_score: res.data.result.total_score,
                grade: res.data.result.grade,
                remark: res.data.result.remark,
              }
            : s
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save result.');
    } finally {
      setSavingId(null);
    }
  };

  // Bulk upload all results
  const handleBulkUpload = async () => {
    const resultsToUpload = Object.entries(grades)
      .filter(([_, g]) => g.ca_score !== '' || g.exam_score !== '')
      .map(([studentId, g]) => ({
        student_id: parseInt(studentId),
        ca_score: g.ca_score || null,
        exam_score: g.exam_score || null,
      }));

    if (resultsToUpload.length === 0) {
      return setError('No grades entered to upload.');
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await uploadBulkResults({
        course_id: selectedCourse.course_id,
        session: selectedCourse.session,
        semester: selectedCourse.semester,
        results: resultsToUpload,
      });

      setMessage(res.data.message || 'Bulk upload complete.');

      // Refresh students to show updated grades
      const refreshRes = await getEnrolledStudents(selectedCourse.course_id, {
        session: selectedCourse.session,
        semester: selectedCourse.semester,
      });
      setStudents(refreshRes.data.students || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload results.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1>Upload Grades</h1>
        <p>Select a course and enter CA/Exam scores for enrolled students.</p>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {/* Course Selection */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '16px' }}>
          Select Course
        </h2>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select
            className="form-control"
            value={selectedCourse ? selectedCourse.course_id : ''}
            onChange={e => {
              const courseId = parseInt(e.target.value);
              const course = courses.find(c => c.course_id === courseId);
              setSelectedCourse(course || null);
            }}
          >
            <option value="">-- Select a course --</option>
            {courses.map(c => (
              <option key={c.assignment_id} value={c.course_id}>
                {c.course_code} — {c.title} ({c.semester}, {c.session})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Course Info */}
      {selectedCourse && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--navy)', marginBottom: '8px' }}>
                {selectedCourse.course_code} — {selectedCourse.title}
              </h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-navy">Level {selectedCourse.level}</span>
                <span className="badge badge-gold" style={{ textTransform: 'capitalize' }}>
                  {selectedCourse.semester} Semester
                </span>
                <span className="badge badge-info">{selectedCourse.session}</span>
                <span className="badge badge-success">
                  {students.length} student{students.length !== 1 ? 's' : ''} enrolled
                </span>
              </div>
            </div>
            {students.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleBulkUpload}
                disabled={saving}
              >
                {saving ? 'Uploading...' : 'Save All Grades'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grading Instructions */}
      {selectedCourse && students.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: '24px' }}>
          <strong>Grading Scale:</strong> CA (0-30) + Exam (0-70) = Total (100). 
          Grades: A (70+), B (60-69), C (50-59), D (45-49), E (40-44), F (&lt;40).
        </div>
      )}

      {/* Students Grading Table */}
      {selectedCourse && (
        loadingStudents ? (
          <div className="spinner-wrapper"><div className="spinner"></div></div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p>No students enrolled in this course for the selected session.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Login ID</th>
                  <th>Student Name</th>
                  <th>CA Score (0-30)</th>
                  <th>Exam Score (0-70)</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const ca = parseFloat(grades[s.id]?.ca_score) || 0;
                  const exam = parseFloat(grades[s.id]?.exam_score) || 0;
                  const total = ca + exam;

                  return (
                    <tr key={s.id}>
                      <td><span className="badge badge-info">{s.login_id}</span></td>
                      <td style={{ fontWeight: 500 }}>{s.full_name}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: '80px', padding: '6px 10px' }}
                          min="0"
                          max="30"
                          value={grades[s.id]?.ca_score ?? ''}
                          onChange={e => handleGradeChange(s.id, 'ca_score', e.target.value)}
                          placeholder="0-30"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: '80px', padding: '6px 10px' }}
                          min="0"
                          max="70"
                          value={grades[s.id]?.exam_score ?? ''}
                          onChange={e => handleGradeChange(s.id, 'exam_score', e.target.value)}
                          placeholder="0-70"
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {grades[s.id]?.ca_score || grades[s.id]?.exam_score ? total : (s.total_score ?? '—')}
                      </td>
                      <td>
                        {s.grade ? (
                          <span className={`badge ${s.grade === 'F' ? 'badge-danger' : s.grade === 'A' ? 'badge-success' : 'badge-info'}`}>
                            {s.grade}
                          </span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleSaveSingle(s)}
                          disabled={savingId === s.id}
                        >
                          {savingId === s.id ? '...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* No course selected */}
      {!selectedCourse && courses.length > 0 && (
        <div className="empty-state">
          <p>Select a course above to begin grading students.</p>
        </div>
      )}

      {courses.length === 0 && (
        <div className="empty-state">
          <p>You have no courses assigned for grading.</p>
        </div>
      )}
    </div>
  );
};
export default GradeUpload;
