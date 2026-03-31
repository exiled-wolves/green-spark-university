import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'var(--navy)',
        padding: '0 48px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '20px' }}>
            Green Spark University
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
            Excellence in Education
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/apply')}
            className="btn btn-gold btn-sm"
          >
            Apply Now
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--white)', borderColor: 'rgba(255,255,255,0.4)' }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--royal) 100%)',
        padding: '100px 48px',
        textAlign: 'center',
        color: 'var(--white)',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 18px',
          background: 'rgba(201,162,39,0.2)',
          border: '1px solid var(--gold)',
          borderRadius: '20px',
          color: 'var(--gold)',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '24px',
        }}>
          Admissions Open — 2024/2025 Session
        </div>
        <h1 style={{
          fontSize: '52px',
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: '20px',
          maxWidth: '700px',
          margin: '0 auto 20px',
        }}>
          Welcome to <span style={{ color: 'var(--gold)' }}>Green Spark</span> University
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: '560px',
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          Empowering the next generation of leaders through quality education,
          research and innovation.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/apply')}
            className="btn btn-gold btn-lg"
          >
            Apply for Admission
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-lg"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'var(--white)',
              border: '1.5px solid rgba(255,255,255,0.3)',
            }}
          >
            Student / Staff Login
          </button>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        background: 'var(--white)',
        padding: '32px 48px',
        display: 'flex',
        justifyContent: 'center',
        gap: '64px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          { value: '10,000+', label: 'Students' },
          { value: '500+',    label: 'Lecturers' },
          { value: '50+',     label: 'Departments' },
          { value: '25+',     label: 'Years of Excellence' },
        ].map(({ value, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--navy)' }}>
              {value}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '32px',
          fontWeight: 700,
          color: 'var(--navy)',
          marginBottom: '12px',
        }}>
          Everything you need in one portal
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: '16px',
          marginBottom: '52px',
        }}>
          Manage your academic journey from admission to graduation
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              icon: '📋',
              title: 'Online Admission',
              desc: 'Apply for admission from anywhere. Fill your form, upload documents and track your application status.',
              color: 'var(--navy)',
            },
            {
              icon: '📚',
              title: 'Course Registration',
              desc: 'Register courses for each semester, view your timetable and track your credit units with ease.',
              color: 'var(--royal)',
            },
            {
              icon: '📊',
              title: 'Results & Grades',
              desc: 'Check your CA scores, exam results and GPA instantly once your lecturer uploads them.',
              color: 'var(--gold)',
            },
            {
              icon: '🔔',
              title: 'Notifications',
              desc: 'Get instant alerts when results are uploaded, announcements are made or complaints are resolved.',
              color: 'var(--success)',
            },
            {
              icon: '👨‍🏫',
              title: 'Lecturer Portal',
              desc: 'Lecturers can upload grades, manage enrolled students, file reports and apply for leave.',
              color: 'var(--royal)',
            },
            {
              icon: '⚙️',
              title: 'Admin Control',
              desc: 'Full administrative control over admissions, courses, staff and student management.',
              color: 'var(--navy)',
            },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className="card" style={{
              borderTop: `3px solid ${color}`,
              transition: 'var(--transition)',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
              <h3 style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--navy)',
                marginBottom: '10px',
              }}>
                {title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--navy)',
        padding: '72px 48px',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--white)', marginBottom: '16px' }}>
          Ready to begin your journey?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '36px' }}>
          Applications are open for the 2024/2025 academic session
        </p>
        <button
          onClick={() => navigate('/apply')}
          className="btn btn-gold btn-lg"
        >
          Start Your Application
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#060f22',
        padding: '24px 48px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '13px',
      }}>
        © {new Date().getFullYear()} Green Spark University. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;