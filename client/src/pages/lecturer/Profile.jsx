import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../services/lecturerService';

const Profile = () => {
  const [lecturer,  setLecturer]  = useState(null);
  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({});
  const [photo,     setPhoto]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const fetchProfile = () => {
    setLoading(true);
    getProfile()
      .then(res => {
        const l = res.data.lecturer;
        setLecturer(l);
        setForm({ phone: l.phone || '', address: l.address || '' });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('phone', form.phone);
      fd.append('address', form.address);
      if (photo) fd.append('passport_photo', photo);
      const res = await updateProfile(fd);
      setSuccess(res.data.message || 'Profile updated successfully.');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error && !lecturer) return <div className="alert alert-danger">{error}</div>;
  if (!lecturer) return null;

  const photoUrl = lecturer.passport_photo
    ? `http://localhost:5000/uploads/${lecturer.passport_photo}`
    : null;

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View and update your lecturer information.</p>
      </div>

      {error   && <div className="alert alert-danger"  onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--gold)', fontSize: '32px', fontWeight: 700, overflow: 'hidden',
        }}>
          {photoUrl
            ? <img src={photoUrl} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : lecturer.full_name?.charAt(0).toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)' }}>{lecturer.full_name}</h2>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-navy">{lecturer.login_id}</span>
            <span className="badge badge-gold">{lecturer.department_name}</span>
            <span className={`badge ${lecturer.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
              {lecturer.status}
            </span>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {editing ? (
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px' }}>Edit Profile</h2>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Passport Photo (JPEG/PNG, max 2MB)</label>
              <input type="file" className="form-control" accept="image/jpeg,image/png"
                onChange={e => setPhoto(e.target.files[0])} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px',
              paddingBottom: '12px', borderBottom: '2px solid var(--gold)' }}>Personal Information</h2>
            {[
              ['Full Name',   lecturer.full_name],
              ['Gender',      lecturer.gender],
              ['Phone',       lecturer.phone],
              ['Email',       lecturer.email],
              ['Address',     lecturer.address],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                <div style={{ color: 'var(--navy)', fontWeight: 600 }}>{val || '—'}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px',
              paddingBottom: '12px', borderBottom: '2px solid var(--gold)' }}>Academic Information</h2>
            {[
              ['Login ID',    lecturer.login_id],
              ['Department',  lecturer.department_name],
              ['Status',      lecturer.status],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                <div style={{ color: 'var(--navy)', fontWeight: 600, textTransform: 'capitalize' }}>{val || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;