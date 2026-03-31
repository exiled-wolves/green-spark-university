import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDepartments, submitApplication } from '../services/applicantService';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

const OLEVEL_SUBJECTS = [
  'English Language','Mathematics','Physics','Chemistry','Biology',
  'Agricultural Science','Economics','Government','Literature in English',
  'Geography','History','Civic Education','Computer Studies',
  'Further Mathematics','Technical Drawing','Food and Nutrition',
  'Christian Religious Studies','Islamic Religious Studies','Commerce',
  'Accounting','French','Yoruba','Igbo','Hausa',
];

const GRADES = ['A1','B2','B3','C4','C5','C6','D7','E8','F9'];

const emptyOlevel = () => ({ subject: '', grade: '' });

const Apply = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState(false);

  const [form, setForm] = useState({
    // Personal info
    full_name:          '',
    date_of_birth:      '',
    gender:             '',
    state_of_origin:    '',
    lga:                '',
    nationality:        'Nigerian',
    phone:              '',
    email:              '',
    residential_address:'',
    // Academic info
    department_id:      '',
    jamb_reg_number:    '',
    jamb_score:         '',
    olevel_results:     [emptyOlevel(), emptyOlevel(), emptyOlevel(),
                         emptyOlevel(), emptyOlevel()],
    // Next of kin
    next_of_kin_name:     '',
    next_of_kin_phone:    '',
    next_of_kin_relation: '',
    // Photo
    passport_photo: null,
  });

  useEffect(() => {
    getDepartments()
      .then(res => setDepartments(res.data.departments))
      .catch(() => setError('Failed to load departments. Please refresh.'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOlevel = (index, field, value) => {
    const updated = [...form.olevel_results];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, olevel_results: updated });
  };

  const addOlevelRow = () => {
    if (form.olevel_results.length < 9) {
      setForm({ ...form, olevel_results: [...form.olevel_results, emptyOlevel()] });
    }
  };

  const removeOlevelRow = (index) => {
    if (form.olevel_results.length > 5) {
      const updated = form.olevel_results.filter((_, i) => i !== index);
      setForm({ ...form, olevel_results: updated });
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return setError('Passport photo must be less than 2MB.');
      }
      setForm({ ...form, passport_photo: file });
    }
  };

  const validateStep = () => {
    setError('');
    if (step === 1) {
      const { full_name, date_of_birth, gender, state_of_origin, lga, phone, email } = form;
      if (!full_name || !date_of_birth || !gender || !state_of_origin || !lga || !phone || !email) {
        return setError('Please fill all required fields.'), false;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        return setError('Please enter a valid email address.'), false;
      }
    }
    if (step === 2) {
      const { department_id, jamb_reg_number, jamb_score } = form;
      if (!department_id || !jamb_reg_number || !jamb_score) {
        return setError('Please fill all academic fields.'), false;
      }
      if (parseInt(jamb_score) < 0 || parseInt(jamb_score) > 400) {
        return setError('JAMB score must be between 0 and 400.'), false;
      }
      const validOlevel = form.olevel_results.filter(r => r.subject && r.grade);
      if (validOlevel.length < 5) {
        return setError("Please enter at least 5 O'level results."), false;
      }
    }
    if (step === 3) {
      const { next_of_kin_name, next_of_kin_phone, next_of_kin_relation, residential_address } = form;
      if (!next_of_kin_name || !next_of_kin_phone || !next_of_kin_relation || !residential_address) {
        return setError('Please fill all required fields.'), false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const prevStep = () => { setError(''); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    const validOlevel = form.olevel_results.filter(r => r.subject && r.grade);

    const data = new FormData();
    data.append('full_name',           form.full_name.trim());
    data.append('date_of_birth',       form.date_of_birth);
    data.append('gender',              form.gender);
    data.append('state_of_origin',     form.state_of_origin);
    data.append('lga',                 form.lga.trim());
    data.append('nationality',         form.nationality);
    data.append('phone',               form.phone.trim());
    data.append('email',               form.email.trim());
    data.append('residential_address', form.residential_address.trim());
    data.append('department_id',       form.department_id);
    data.append('jamb_reg_number',     form.jamb_reg_number.trim().toUpperCase());
    data.append('jamb_score',          form.jamb_score);
    data.append('olevel_results',      JSON.stringify(validOlevel));
    data.append('next_of_kin_name',    form.next_of_kin_name.trim());
    data.append('next_of_kin_phone',   form.next_of_kin_phone.trim());
    data.append('next_of_kin_relation',form.next_of_kin_relation.trim());
    if (form.passport_photo) {
      data.append('passport_photo', form.passport_photo);
    }

    setLoading(true);
    try {
      await submitApplication(data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────
  if (success) return (
    <div style={{
      minHeight: '100vh', background: 'var(--navy)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--navy)', marginBottom: '12px' }}>
          Application Submitted!
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.7 }}>
          Your application has been received. You will be notified via email
          about the outcome of your admission.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary w-full">
          Back to Home
        </button>
      </div>
    </div>
  );

  // ── Step indicator ────────────────────────────────────────────
  const steps = ['Personal Info', 'Academic Info', 'Next of Kin', 'Review & Submit'];

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)',
    background: 'var(--white)',
    color: 'var(--text)', fontSize: '15px',
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: 500,
    color: 'var(--navy)', marginBottom: '6px', display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <nav style={{
        background: 'var(--navy)', padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '18px' }}>
          Green Spark University
        </div>
        <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
          Already admitted? Login
        </Link>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--navy)' }}>
            Admission Application
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
            2024/2025 Academic Session
          </p>
        </div>

        {/* Step indicators */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: '36px', gap: '0',
        }}>
          {steps.map((label, i) => {
            const num     = i + 1;
            const active  = step === num;
            const done    = step > num;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: done ? 'var(--success)' : active ? 'var(--navy)' : 'var(--border)',
                    color: done || active ? 'var(--white)' : 'var(--muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 600,
                    transition: 'var(--transition)',
                  }}>
                    {done ? '✓' : num}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: active ? 'var(--navy)' : 'var(--muted)',
                    fontWeight: active ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    width: '60px', height: '2px', margin: '0 4px',
                    background: done ? 'var(--success)' : 'var(--border)',
                    marginBottom: '22px',
                    transition: 'var(--transition)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="card">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Personal Info ───────────────────── */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '24px' }}>
                  Personal Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="full_name" style={inputStyle} placeholder="As it appears on your certificate"
                      value={form.full_name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Date of Birth <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="date" name="date_of_birth" style={inputStyle}
                      value={form.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Gender <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="gender" style={inputStyle} value={form.gender} onChange={handleChange}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>State of Origin <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="state_of_origin" style={inputStyle} value={form.state_of_origin} onChange={handleChange}>
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>LGA <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="lga" style={inputStyle} placeholder="Local Government Area"
                      value={form.lga} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Nationality</label>
                    <input name="nationality" style={inputStyle}
                      value={form.nationality} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Phone Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="phone" style={inputStyle} placeholder="08012345678"
                      value={form.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Email Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="email" name="email" style={inputStyle} placeholder="your@email.com"
                      value={form.email} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Passport Photo</label>
                    <input type="file" accept="image/jpeg,image/png" style={inputStyle}
                      onChange={handlePhoto} />
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      JPEG or PNG, max 2MB
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Academic Info ───────────────────── */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '24px' }}>
                  Academic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="department_id" style={inputStyle}
                      value={form.department_id} onChange={handleChange}>
                      <option value="">Select department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.acronym})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>JAMB Reg. Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="jamb_reg_number" style={inputStyle} placeholder="e.g. 12345678AB"
                      value={form.jamb_reg_number} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>JAMB Score <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input type="number" name="jamb_score" style={inputStyle}
                      placeholder="0 – 400" min="0" max="400"
                      value={form.jamb_score} onChange={handleChange} />
                  </div>
                </div>

                {/* O'level results */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      O'Level Results <span style={{ color: 'var(--danger)' }}>*</span>
                      <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: '6px' }}>
                        (min. 5 subjects)
                      </span>
                    </label>
                    <button type="button" onClick={addOlevelRow} className="btn btn-outline btn-sm">
                      + Add Subject
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {form.olevel_results.map((row, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: '8px', alignItems: 'center' }}>
                        <select
                          style={inputStyle}
                          value={row.subject}
                          onChange={e => handleOlevel(i, 'subject', e.target.value)}
                        >
                          <option value="">Select subject</option>
                          {OLEVEL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                          style={inputStyle}
                          value={row.grade}
                          onChange={e => handleOlevel(i, 'grade', e.target.value)}
                        >
                          <option value="">Grade</option>
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeOlevelRow(i)}
                          disabled={form.olevel_results.length <= 5}
                          style={{
                            width: '34px', height: '34px',
                            background: 'var(--danger)', color: 'var(--white)',
                            borderRadius: 'var(--radius)', fontSize: '16px',
                            opacity: form.olevel_results.length <= 5 ? 0.4 : 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Next of Kin ─────────────────────── */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '24px' }}>
                  Next of Kin & Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <div className="form-group">
                    <label style={labelStyle}>Next of Kin Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="next_of_kin_name" style={inputStyle}
                      value={form.next_of_kin_name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label style={labelStyle}>Next of Kin Phone <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input name="next_of_kin_phone" style={inputStyle}
                      value={form.next_of_kin_phone} onChange={handleChange} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Relationship <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <select name="next_of_kin_relation" style={inputStyle}
                      value={form.next_of_kin_relation} onChange={handleChange}>
                      <option value="">Select relationship</option>
                      {['Father','Mother','Sibling','Spouse','Guardian','Uncle','Aunt','Other']
                        .map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Residential Address <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <textarea name="residential_address" rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                      placeholder="Full home address"
                      value={form.residential_address} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Review ──────────────────────────── */}
            {step === 4 && (
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--navy)', marginBottom: '24px' }}>
                  Review your application
                </h3>

                {[
                  {
                    title: 'Personal Information',
                    fields: [
                      ['Full Name',       form.full_name],
                      ['Date of Birth',   form.date_of_birth],
                      ['Gender',          form.gender],
                      ['State of Origin', form.state_of_origin],
                      ['LGA',             form.lga],
                      ['Nationality',     form.nationality],
                      ['Phone',           form.phone],
                      ['Email',           form.email],
                    ],
                  },
                  {
                    title: 'Academic Information',
                    fields: [
                      ['Department',        departments.find(d => String(d.id) === String(form.department_id))?.name || '—'],
                      ['JAMB Reg. Number',  form.jamb_reg_number],
                      ['JAMB Score',        form.jamb_score],
                    ],
                  },
                  {
                    title: 'Next of Kin',
                    fields: [
                      ['Name',         form.next_of_kin_name],
                      ['Phone',        form.next_of_kin_phone],
                      ['Relationship', form.next_of_kin_relation],
                      ['Address',      form.residential_address],
                    ],
                  },
                ].map(({ title, fields }) => (
                  <div key={title} style={{ marginBottom: '24px' }}>
                    <h4 style={{
                      fontSize: '13px', fontWeight: 600,
                      color: 'var(--royal)', textTransform: 'uppercase',
                      letterSpacing: '0.5px', marginBottom: '12px',
                    }}>
                      {title}
                    </h4>
                    <div style={{
                      background: 'var(--bg)',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                    }}>
                      {fields.map(([label, value]) => (
                        <div key={label} style={{
                          display: 'grid', gridTemplateColumns: '180px 1fr',
                          padding: '10px 16px',
                          borderBottom: '1px solid var(--border)',
                          fontSize: '14px',
                        }}>
                          <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
                          <span style={{ color: 'var(--text)' }}>{value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{
                  background: 'var(--card)',
                  borderLeft: '4px solid var(--navy)',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius)',
                  fontSize: '13px',
                  color: 'var(--navy)',
                }}>
                  By submitting, you confirm that all information provided is accurate and truthful.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '32px', paddingTop: '20px',
              borderTop: '1px solid var(--border)',
            }}>
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-outline"
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
              >
                ← Previous
              </button>

              {step < 4 ? (
                <button type="button" onClick={nextStep} className="btn btn-primary">
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={loading}
                  style={{ minWidth: '160px' }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '24px' }}>
          © {new Date().getFullYear()} Green Spark University
        </p>
      </div>
    </div>
  );
};

export default Apply;