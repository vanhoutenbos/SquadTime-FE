import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { strings } from '../strings';

interface WaitlistPageProps {
  onAdmitted: () => void;
}

export function WaitlistPage({ onAdmitted }: WaitlistPageProps) {
  const navigate = useNavigate();
  const [position, setPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closed, setClosed] = useState(false);

  const fetchPosition = useCallback(async () => {
    try {
      const response = await fetch('/api/waitlist/position', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPosition(data.position);
        if (data.has_access) {
          onAdmitted();
        }
      } else if (response.status === 401) {
        navigate('/login');
      }
    } catch {
      setError('Failed to load position');
    } finally {
      setLoading(false);
    }
  }, [navigate, onAdmitted]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('closed') === '1') {
      setClosed(true);
    }
    fetchPosition();

    // Poll for position updates
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  const handleLeave = async () => {
    if (!confirm('Leave the waitlist and delete your data? This cannot be undone.')) return;

    try {
      await fetch('/api/user', { method: 'DELETE', credentials: 'include' });
      navigate('/login');
    } catch {
      setError('Failed to leave waitlist');
    }
  };

  if (closed) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>{strings.full.title}</h1>
          <p style={styles.text}>Signups are currently closed. Please try again later.</p>
          <a href="/login" style={styles.backLink}>
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon} aria-hidden="true">
          ⏳
        </div>
        <h1 style={styles.title}>You're on the waitlist</h1>

        {loading ? (
          <p style={styles.text}>Loading your position...</p>
        ) : position !== null ? (
          <>
            <p style={styles.position}>
              {strings.waitlist.position.replace('{n}', String(position))}
            </p>
            <p style={styles.text}>
              We'll let you know when a spot opens up.
              <a
                href="https://discord.gg/XmzRNm9N6Y"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Join the community
              </a>{' '}
              for updates.
            </p>
          </>
        ) : (
          <p style={styles.text}>Unable to load position. Please refresh.</p>
        )}

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        <button onClick={handleLeave} style={styles.leaveButton}>
          {strings.waitlist.leave}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  position: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--amber)',
    margin: '8px 0 0',
  },
  text: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: 0,
    textAlign: 'center',
    lineHeight: '1.6',
  },
  link: {
    color: 'var(--amber)',
    textDecoration: 'underline',
  },
  error: {
    background: 'rgba(255, 138, 138, 0.1)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    width: '100%',
    textAlign: 'left',
    marginTop: '8px',
  },
  leaveButton: {
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    padding: '10px 20px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginTop: '8px',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '16px',
    color: 'var(--amber)',
    textDecoration: 'underline',
  },
};
