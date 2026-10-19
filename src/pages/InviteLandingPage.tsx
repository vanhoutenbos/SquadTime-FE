import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { acceptInvite } from '../utils/invite';
import { config } from '../config';

export function InviteLandingPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [verifying, setVerifying] = useState(true);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid invite link');
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`/api/invites/verify/${token}`);
        const data = await response.json();

        if (data.valid) {
          setInviterName(data.inviter_name);
        } else {
          setError(data.error || 'Invalid or expired invite');
        }
      } catch {
        setError('Failed to verify invite');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setAccepting(true);
    setError(null);

    const result = await acceptInvite(token);

    if (result.success) {
      // Redirect to main page
      navigate('/main');
    } else {
      setError(result.error || 'Failed to accept invite');
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/main');
  };

  if (authLoading || verifying) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loading}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="SquadTime logo" style={styles.logoImage} />
            <h1 style={styles.logo}>{config.productName}</h1>
          </div>

          {error ? (
            <>
              <h2 style={styles.title}>Invite not found</h2>
              <p style={styles.description}>{error}</p>
              <button onClick={() => navigate('/')} style={styles.primaryButton}>
                Go to home
              </button>
            </>
          ) : inviterName ? (
            <>
              <h2 style={styles.title}>{inviterName} invited you</h2>
              <p style={styles.description}>
                Log in with Discord to accept the invite and coordinate gaming times with your
                squad.
              </p>
              <button
                onClick={() => (window.location.href = '/api/auth/login')}
                style={styles.primaryButton}
              >
                Log in with Discord
              </button>
            </>
          ) : (
            <>
              <h2 style={styles.title}>Welcome to {config.productName}</h2>
              <p style={styles.description}>Log in to continue.</p>
              <button
                onClick={() => (window.location.href = '/api/auth/login')}
                style={styles.primaryButton}
              >
                Log in with Discord
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Logged in - show accept/decline
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoContainer}>
            <img src="/logo.png" alt="SquadTime logo" style={styles.logoImage} />
            <h1 style={styles.logo}>{config.productName}</h1>
          </div>
          <p style={styles.description}>{error}</p>
          <button onClick={() => navigate('/main')} style={styles.primaryButton}>
            Go to calendar
          </button>
        </div>
      </div>
    );
  }

  if (!inviterName) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.loading}>Verifying invite...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src="/logo.png" alt="SquadTime logo" style={styles.logoImage} />
          <h1 style={styles.logo}>{config.productName}</h1>
        </div>

        <h2 style={styles.title}>{inviterName} invited you</h2>
        <p style={styles.description}>
          Accept to see each other's availability and coordinate gaming times.
        </p>

        <div style={styles.buttonGroup}>
          <button onClick={handleAccept} disabled={accepting} style={styles.primaryButton}>
            {accepting ? 'Accepting...' : 'Accept'}
          </button>
          <button onClick={handleDecline} disabled={accepting} style={styles.secondaryButton}>
            Not now
          </button>
        </div>
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
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  logoImage: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
  },
  logo: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: 'var(--text)',
    margin: '0 0 12px',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-2)',
    lineHeight: '1.5',
    margin: '0 0 24px',
  },
  loading: {
    fontSize: '15px',
    color: 'var(--text-2)',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    width: '100%',
    minHeight: '44px',
    padding: '0 20px',
    borderRadius: '10px',
    border: '1px solid var(--amber)',
    background: 'var(--amber)',
    color: '#1A1203',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  secondaryButton: {
    width: '100%',
    minHeight: '44px',
    padding: '0 20px',
    borderRadius: '10px',
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};
