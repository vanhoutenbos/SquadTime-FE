import { useState, useEffect } from 'react';
import { strings } from '../strings';

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      const messages: Record<string, string> = {
        invalid_state: 'Invalid login state. Please try again.',
        no_code: 'Login failed. Please try again.',
        token_exchange: 'Failed to connect with Discord. Please try again.',
        user_fetch: 'Failed to get your Discord info. Please try again.',
        server_error: 'An error occurred. Please try again.',
      };
      setError(messages[err] || 'Login failed. Please try again.');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.pixelDesk} aria-hidden="true">
          <PixelDesk />
        </div>
        <h1 style={styles.title}>{strings.home.title}</h1>
        <p style={styles.subtitle}>See when your gaming friends are free</p>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        <a href="/api/auth/login" style={styles.loginButton}>
          <svg
            style={styles.discordIcon}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.764-.693 1.163a19.277 19.277 0 0 0-5.425 0 12.62 12.62 0 0 0-.695-1.163.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.68 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.994 6.267.077.077 0 0 0 .084-.028c.464-.613.977-1.217 1.483-1.847a.077.077 0 0 1 .085-.001 13.294 13.294 0 0 0 1.635 1.543.074.074 0 0 0 .084.028c2.651-1.636 5.128-3.595 6.967-5.071a.077.077 0 0 0 .083-.028.07.07 0 0 0 .031-.057c.423-4.627-.472-9.226-3.548-13.66a.061.061 0 0 0-.032-.027zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418z" />
          </svg>
          <span>Log in with Discord</span>
        </a>

        <p style={styles.note}>By logging in, you agree to our Terms and Privacy Policy.</p>
      </div>
    </div>
  );
}

function PixelDesk() {
  return (
    <svg width="200" height="160" viewBox="0 0 200 160" style={styles.pixelDeskSvg}>
      {/* Monitor */}
      <rect x="50" y="20" width="100" height="70" fill="#1C1F26" stroke="#2A2E38" strokeWidth="2" />
      <rect x="54" y="24" width="92" height="62" fill="#14161B" />
      <rect x="60" y="30" width="80" height="12" fill="#2EE6A6" opacity="0.3" />
      <rect x="60" y="46" width="80" height="30" fill="#2A2E38" opacity="0.5" />
      {/* Monitor stand */}
      <rect x="90" y="90" width="20" height="10" fill="#2A2E38" />
      <rect x="80" y="100" width="40" height="6" fill="#2A2E38" />
      {/* Keyboard */}
      <rect
        x="55"
        y="110"
        width="90"
        height="20"
        fill="#1C1F26"
        stroke="#2A2E38"
        strokeWidth="1.5"
      />
      <rect x="58" y="113" width="84" height="14" fill="#14161B" />
      {/* Mouse */}
      <ellipse cx="155" cy="120" rx="12" ry="8" fill="#1C1F26" stroke="#2A2E38" strokeWidth="1.5" />
      <ellipse cx="155" cy="118" rx="8" ry="5" fill="#2A2E38" />
      {/* Headphones */}
      <path
        d="M30 70 Q20 70 20 50 Q20 30 40 30"
        stroke="#FFB547"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="40" cy="30" r="6" fill="#FFB547" />
      <circle cx="20" cy="50" r="8" fill="#FFB547" />
      <circle cx="20" cy="50" r="4" fill="#14161B" />
      {/* Plant */}
      <rect x="165" y="80" width="8" height="20" fill="#3A404C" />
      <ellipse cx="169" cy="75" rx="12" ry="10" fill="#2EE6A6" opacity="0.8" />
      <ellipse cx="172" cy="72" rx="8" ry="6" fill="#2EE6A6" />
    </svg>
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
    gap: '20px',
  },
  pixelDesk: {
    width: '200px',
    height: '160px',
  },
  pixelDeskSvg: {
    display: 'block',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: 0,
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
  },
  loginButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'var(--amber)',
    color: '#1A1203',
    padding: '14px 28px',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: 'inherit',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
    width: '100%',
    maxWidth: '280px',
    justifyContent: 'center',
  },
  discordIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  note: {
    fontSize: '12px',
    color: 'var(--muted)',
    margin: 0,
  },
};
