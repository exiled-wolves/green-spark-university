import { useState, useEffect } from 'react';
import { getResults } from '../../services/studentService';

const gradeColor = (grade) => {
  if (!grade) return 'badge-info';
  if (grade === 'A') return 'badge-success';
  if (grade === 'F') return 'badge-danger';
  if (grade === 'E') return 'badge-warning';
  return 'badge-info';
};

const Results = () => {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [semFilter, setSemFilter] = useState('');

  useEffect(() => {
    getResults()
      .then(res => setResults(res.data.results || []))
      .catch(() => setError('Failed to load results.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const semesters = [...new Set(results.map(r => r.semester))];
  const filtered = semFilter ? results.filter(r => r.semester === semFilter) : results;

  const totalUnits = filtered.filter(r => r.grade && r.grade !== 'F').reduce((s, r) => s + (r.credit_units || 0), 0);
  const totalPoints = filtered.filter(r => r.grade).reduce((s, r) => {
    const pts = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[r.grade] || 0;
    return s + pts * (r.credit_units || 0);
  }, 0);
  const totalWeighted = filtered.filter(r => r.grade).reduce((s, r) => s + (r.credit_units || 0), 0);
  const gpa = totalWeighted > 0 ? (totalPoints / totalWeighted).toFixed(2) : '—';

  return (
    <div>
      <div className="page-header">
        <h1>Results & Grades</h1>
        <p>View your academic performance per course.</p>
      </div>

      {results.length === 0 ? (
        <div className="empty-state"><p>No results available yet. Check back after your lecturers upload grades.</p></div>
      ) : (
        <>
          {/* GPA Summary */}
          <div className="stats-grid" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <h3>Courses with Results</h3>
              <div className="stat-value">{filtered.filter(r => r.grade).length}</div>
            </div>
            <div className="stat-card royal">
              <h3>Units Earned</h3>
              <div className="stat-value">{totalUnits}</div>
            </div>
            <div className="stat-card gold">
              <h3>GPA (Semester)</h3>
              <div className="stat-value">{gpa}</div>
            </div>
          </div>

          {semesters.length > 1 && (
            <div style={{ marginBottom: '16px' }}>
              <select className="form-control" style={{ width: '200px' }} value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                <option value="">All Semesters</option>
                {semesters.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Units</th>
                  <th>CA Score</th>
                  <th>Exam Score</th>
                  <th>Total</th>
                  <th>Grade</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id || r.course_id}>
                    <td><span className="badge badge-navy">{r.course_code}</span></td>
                    <td>{r.course_name}</td>
                    <td>{r.credit_units}</td>
                    <td>{r.ca_score ?? '—'}</td>
                    <td>{r.exam_score ?? '—'}</td>
                    <td style={{ fontWeight: 600 }}>{r.total_score ?? '—'}</td>
                    <td>
                      {r.grade
                        ? <span className={`badge ${gradeColor(r.grade)}`}>{r.grade}</span>
                        : <span className="badge badge-warning">Pending</span>
                      }
                    </td>
                    <td>
                      {r.remark
                        ? <span className={r.remark === 'Fail' ? 'text-danger' : 'text-success'}
                            style={{ fontSize: '13px', fontWeight: 500 }}>{r.remark}</span>
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;