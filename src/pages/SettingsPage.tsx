import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { strings } from '../strings';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [timezone, setTimezone] = useState('');
  const [sharing, setSharing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setTimezone(user.timezone);
      setSharing(user.sharing);
    }
  }, [user]);

  const handleTimezoneChange = async (newTimezone: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/timezone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ timezone: newTimezone }),
      });

      if (response.ok) {
        setTimezone(newTimezone);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update timezone');
      }
    } catch {
      setError('Failed to update timezone');
    } finally {
      setSaving(false);
    }
  };

  const handleSharingToggle = async (newSharing: boolean) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sharing: newSharing }),
      });

      if (response.ok) {
        setSharing(newSharing);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update sharing');
      }
    } catch {
      setError('Failed to update sharing');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.loading}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            ← Back
          </button>
          <h1 style={styles.title}>Settings</h1>
        </div>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* Timezone */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Timezone</h2>
          <p style={styles.sectionDescription}>
            Every time in the app is converted to this timezone. Daylight saving time is handled
            automatically.
          </p>

          <select
            value={timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={saving}
            style={styles.select}
          >
            {/* Common timezones */}
            <optgroup label="Common">
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Amsterdam">Amsterdam (CET/CEST)</option>
              <option value="Europe/Berlin">Berlin (CET/CEST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
              <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
            </optgroup>
            <optgroup label="All timezones">
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Sharing */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Share my times</h2>
          <p style={styles.sectionDescription}>
            When sharing is on, friends can see your availability and you can see theirs. When
            sharing is off, you can't see anyone's times and they can't see yours. Your saved times
            are kept.
          </p>

          <label style={styles.toggle}>
            <input
              type="checkbox"
              checked={sharing}
              onChange={(e) => handleSharingToggle(e.target.checked)}
              disabled={saving}
              style={styles.checkbox}
            />
            <span style={styles.toggleLabel}>{sharing ? 'Sharing on' : 'Sharing off'}</span>
          </label>

          {!sharing && (
            <div style={styles.sharingOffPreview}>
              <p style={styles.previewLabel}>When sharing is off, you'll see:</p>
              <div style={styles.previewCard}>
                <p style={styles.previewText}>{strings.sharingOff.title}</p>
                <p style={styles.previewText2}>{strings.sharingOff.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    marginBottom: '32px',
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-2)',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  loading: {
    textAlign: 'center',
    padding: '48px',
    color: 'var(--text-2)',
  },
  error: {
    background: 'rgba(255, 138, 138, 0.1)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '24px',
  },
  section: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text)',
    margin: '0 0 8px',
  },
  sectionDescription: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: '0 0 16px',
    lineHeight: '1.5',
  },
  select: {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'inherit',
    padding: '10px 12px',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  toggleLabel: {
    fontSize: '15px',
    fontWeight: 500,
    color: 'var(--text)',
  },
  sharingOffPreview: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border)',
  },
  previewLabel: {
    fontSize: '13px',
    color: 'var(--text-2)',
    margin: '0 0 12px',
  },
  previewCard: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px',
  },
  previewText: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text)',
    margin: '0 0 4px',
  },
  previewText2: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: 0,
  },
};
