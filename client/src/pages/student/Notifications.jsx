import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/studentService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [marking, setMarking] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    getNotifications()
      .then(res => setNotifications(res.data.notifications || []))
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch {
      setError('Failed to mark all as read.');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="spinner-wrapper"><div className="spinner"></div></div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with your academic alerts and announcements.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleMarkAll} disabled={marking}>
            {marking ? 'Marking...' : 'Mark All as Read'}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
          <p>You have no notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              style={{
                background: n.is_read ? 'var(--white)' : 'var(--card)',
                border: n.is_read ? '1px solid var(--border)' : '1.5px solid var(--royal)',
                borderLeft: n.is_read ? '4px solid var(--border)' : '4px solid var(--royal)',
                borderRadius: 'var(--radius)',
                padding: '16px 20px',
                cursor: n.is_read ? 'default' : 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: n.is_read ? 400 : 600, color: 'var(--navy)', fontSize: '14px', marginBottom: '4px' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.is_read && (
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: 'var(--royal)', flexShrink: 0, marginTop: '4px', marginLeft: '12px',
                  }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;