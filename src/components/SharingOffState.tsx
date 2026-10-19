import { useNavigate } from 'react-router-dom';
import { strings } from '../strings';

export function SharingOffState() {
  const navigate = useNavigate();

  const handleTurnOnSharing = async () => {
    try {
      const response = await fetch('/api/user/sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sharing: true }),
      });

      if (response.ok) {
        // Reload to show calendar
        window.location.reload();
      }
    } catch {
      // Silent fail, let Settings handle it
    }
  };

  return (
    <div style={styles.container}>
      {/* Placeholder calendar grid */}
      <div style={styles.placeholderGrid}>
        <div style={styles.placeholderOverlay}>
          <div style={styles.card}>
            <h2 style={styles.title}>{strings.sharingOff.title}</h2>
            <p style={styles.description}>{strings.sharingOff.description}</p>
            <p style={styles.savedNote}>Your saved times are kept.</p>

            <div style={styles.actions}>
              <button onClick={handleTurnOnSharing} style={styles.primaryButton}>
                {strings.sharingOff.cta}
              </button>
              <button onClick={() => navigate('/settings')} style={styles.secondaryButton}>
                {strings.sharingOff.settingsLink}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    position: 'relative',
  },
  placeholderGrid: {
    position: 'relative',
    minHeight: '400px',
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Blurred placeholder pattern
    backgroundImage: `
      repeating-linear-gradient(
        90deg,
        var(--border) 0px,
        var(--border) 1px,
        transparent 1px,
        transparent 100px
      ),
      repeating-linear-gradient(
        0deg,
        var(--border) 0px,
        var(--border) 1px,
        transparent 1px,
        transparent 40px
      )
    `,
    opacity: 0.3,
  },
  placeholderOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(18, 18, 18, 0.85)',
    backdropFilter: 'blur(8px)',
    padding: '24px',
  },
  card: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '32px 24px',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 12px',
  },
  description: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: '0 0 8px',
    lineHeight: '1.6',
  },
  savedNote: {
    fontSize: '13px',
    color: 'var(--text-2)',
    margin: '0 0 24px',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    background: 'var(--amber)',
    color: 'var(--bg)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  secondaryButton: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    padding: '12px 24px',
    borderRadius: '999px',
    fontSize: '15px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
};
