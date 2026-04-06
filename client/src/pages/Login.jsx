import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';

const Login = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,    setForm]    = useState({ login_id: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login_id || !form.password) {
      return setError('Please enter your Login ID and password.');
    }

    setLoading(true);
    try {
      const res = await loginService(form);
      const data = res.data;

      login(data);

      // Rule 2 — if first login, go to change password
      if (data.is_first_login && data.role !== 'admin') {
        return navigate('/change-password');
      }

      // Route by role
      if (data.role === 'admin')    return navigate('/admin/dashboard');
      if (data.role === 'student')  return navigate('/student/dashboard');
      if (data.role === 'lecturer') return navigate('/lecturer/dashboard');

    } catch (err) {
      console.error('[v0] Login error:', err);
      console.error('[v0] Error response:', err.response?.data);
      console.error('[v0] Error status:', err.response?.status);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '24px' }}>
            Green Spark University
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '6px' }}>
            Student & Staff Portal
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <h2 style={{
            fontSize: '20px', fontWeight: 600,
            color: 'var(--navy)', marginBottom: '6px',
          }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
            Use your Login ID or admin email to continue
          </p>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Login ID / Email</label>
              <input
                type="text"
                name="login_id"
                className="form-control"
                placeholder="e.g. GSU/CSC/25/4821"
                value={form.login_id}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ marginTop: '8px', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Looking to apply for admission?{' '}
              <Link to="/apply" style={{ color: 'var(--royal)', fontWeight: 500 }}>
                Apply here
              </Link>
            </p>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '12px',
          marginTop: '24px',
        }}>
          © {new Date().getFullYear()} Green Spark University
        </p>
      </div>
    </div>
  );
};

export default Login;
