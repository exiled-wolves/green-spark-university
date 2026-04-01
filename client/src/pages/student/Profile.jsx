import { useState, useEffect } from 'react';
import { getProfile } from '../../services/studentService';

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    getProfile()
      .then(res => setStudent(res.data.student))
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;
  if (!student) return null;

  const Section = ({ title, children }) => (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--navy)', marginBottom: '20px',
        paddingBottom: '12px', borderBottom: '2px solid var(--gold)' }}>
        {title}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value }) => (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
      <div style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
      <div style={{ color: 'var(--navy)', fontWeight: 600, textTransform: value === student.status || label === 'Gender' || label === 'Status' ? 'capitalize' : 'none' }}>
        {value || '—'}
      </div>
    </div>
  );

  const photoUrl = student.passport_photo
    ? `http://localhost:5000/uploads/${student.passport_photo}`
    : null;

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your bio-data and academic information.</p>
      </div>

      {/* Header card */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
          background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--gold)', fontSize: '32px', fontWeight: 700, overflow: 'hidden',
        }}>
          {photoUrl
            ? <img src={photoUrl} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : student.full_name?.charAt(0).toUpperCase()
          }
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)' }}>{student.full_name}</h2>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-navy">{student.login_id}</span>
            <span className="badge badge-gold">{student.department_name}</span>
            <span className={`badge ${student.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
              {student.status}
            </span>
            <span className="badge badge-info">{student.level} Level</span>
          </div>
        </div>
      </div>

      <Section title="Personal Information">
        <Field label="Full Name"        value={student.full_name} />
        <Field label="Date of Birth"    value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : null} />
        <Field label="Gender"           value={student.gender} />
        <Field label="Nationality"      value={student.nationality} />
        <Field label="State of Origin"  value={student.state_of_origin} />
        <Field label="LGA"              value={student.lga} />
        <Field label="Phone Number"     value={student.phone} />
        <Field label="Email Address"    value={student.email} />
        <Field label="Residential Address" value={student.address} />
      </Section>

      <Section title="Academic Information">
        <Field label="Login ID"       value={student.login_id} />
        <Field label="Department"     value={student.department_name} />
        <Field label="Level"          value={student.level ? student.level + ' Level' : null} />
        <Field label="JAMB Reg No."   value={student.jamb_reg_no} />
        <Field label="JAMB Score"     value={student.jamb_score} />
        <Field label="Applied Year"   value={student.applied_year} />
        <Field label="Status"         value={student.status} />
      </Section>

      {student.next_of_kin_name && (
        <Section title="Next of Kin">
          <Field label="Name"         value={student.next_of_kin_name} />
          <Field label="Phone"        value={student.next_of_kin_phone} />
          <Field label="Relationship" value={student.next_of_kin_relationship} />
        </Section>
      )}
    </div>
  );
};

export default Profile;