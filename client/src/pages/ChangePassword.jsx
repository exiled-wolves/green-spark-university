import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';

const ChangePassword = () => {
  const { clearFirstLogin, role } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.current_password || !form.new_password || !form.confirm_password) {
      return setError('All fields are required.');
    }
    if (form.new_password !== form.confirm_password) {
      return setError('New passwords do not match.');
    }
    if (form.new_password.length < 6) {
      return setError('New password must be at least 6 characters.');
    }
    if (form.new_password === '1234') {
      return setError('You cannot keep the default password.');
    }

    setLoading(true);
    try {
      await changePassword(form);
      setSuccess('Password changed successfully! Redirecting...');
      clearFirstLogin();

      setTimeout(() => {
        if (role === 'student')  navigate('/student/dashboard');
        if (role === 'lecturer') navigate('/lecturer/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '22px' }}>
            Green Spark University
          </div>
        </div>

        <div className="card">
          <div style={{
            background: 'var(--card)',
            borderLeft: '4px solid var(--gold)',
            padding: '14px 16px',
            borderRadius: 'var(--radius)',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 500 }}>
              Security Notice
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
              You must change your default password before accessing the portal.
            </p>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--navy)', marginBottom: '24px' }}>
            Change your password
          </h2>

          {error   && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current password</label>
              <input
                type="password"
                name="current_password"
                className="form-control"
                placeholder="Enter current password (1234)"
                value={form.current_password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New password</label>
              <input
                type="password"
                name="new_password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={form.new_password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input
                type="password"
                name="confirm_password"
                className="form-control"
                placeholder="Re-enter new password"
                value={form.confirm_password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ marginTop: '8px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;