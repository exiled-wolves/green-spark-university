import { useState, useEffect } from 'react';
import { getStudentReports, reviewReport } from '../../services/adminService';

const Reports = () => {
  const [reports,  setReports]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');

  const fetchReports = () => {
    setLoading(true);
    getStudentReports()
      .then(res => setReports(res.data.reports))
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleReview = async (id) => {
    try {
      await reviewReport(id);
      setMessage('Report marked as reviewed.');
      fetchReports();
    } catch {
      setError('Failed to update report.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Student Reports</h1>
        <p>Reports filed by lecturers against students.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {message && <div className="alert alert-success" onClick={() => setMessage('')}>{message}</div>}

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner"></div></div>
      ) : reports.length === 0 ? (
        <div className="empty-state"><p>No student reports found.</p></div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Login ID</th>
                <th>Course</th>
                <th>Reported By</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.student_name}</td>
                  <td><code style={{ fontSize: '13px', color: 'var(--royal)' }}>{r.student_login_id}</code></td>
                  <td>{r.course_code}</td>
                  <td>{r.lecturer_name}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.reason}
                  </td>
                  <td>
                    <span className={`badge ${r.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'pending' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleReview(r.id)}>
                        Mark Reviewed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;