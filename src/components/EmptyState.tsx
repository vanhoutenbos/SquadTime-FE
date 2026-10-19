import { strings } from '../strings';

interface EmptyStateProps {
  onInviteFriends?: () => void;
  onAddTimes?: () => void;
}

export function EmptyState({ onInviteFriends, onAddTimes }: EmptyStateProps) {
  return (
    <div style={styles.container}>
      {/* Dimmed calendar grid */}
      <div style={styles.calendarWrapper} aria-hidden="true">
        <div style={styles.calendar}>
          <div style={styles.calendarGrid}>
            <span style={styles.cornerLabel}></span>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <span key={day} style={styles.dayHeader}>
                {day}
                <br />
                {5 + idx}
              </span>
            ))}

            {/* Generate empty slots */}
            {Array.from({ length: 14 }).map((_, rowIdx) => {
              const hour = 17 + Math.floor(rowIdx / 2);
              const isHourStart = rowIdx % 2 === 0;

              return (
                <div key={rowIdx} style={styles.row}>
                  <span style={styles.hourLabel}>
                    {isHourStart ? `${hour.toString().padStart(2, '0')}:00` : ''}
                  </span>
                  {Array.from({ length: 7 }).map((_, dayIdx) => (
                    <span key={dayIdx} className="c0" style={styles.slot}></span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Overlay with empty state message */}
        <div style={styles.overlay}>
          <div style={styles.card} role="status">
            <h2 style={styles.cardTitle}>{strings.emptyState.title}</h2>
            <p style={styles.cardDescription}>{strings.emptyState.description}</p>
            <button onClick={onInviteFriends} style={styles.primaryButton}>
              Invite friends
            </button>
            <button onClick={onAddTimes} style={styles.secondaryButton}>
              Add my schedule
            </button>
          </div>
        </div>
      </div>

      {/* How it works section (mobile) */}
      <div style={styles.howItWorks}>
        <h3 style={styles.howItWorksTitle}>How it works</h3>
        <div style={styles.step}>
          <span style={styles.stepNumber}>1</span>
          <span style={styles.stepText}>Invite a friend</span>
        </div>
        <div style={styles.step}>
          <span style={styles.stepNumber}>2</span>
          <span style={styles.stepText}>They add their times</span>
        </div>
        <div style={styles.step}>
          <span style={styles.stepNumber}>3</span>
          <span style={styles.stepText}>See when you can all play</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  calendarWrapper: {
    position: 'relative',
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '12px',
    minHeight: '400px',
  },
  calendar: {
    opacity: 0.35,
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: '34px repeat(7, 1fr)',
    gap: '2px',
  },
  cornerLabel: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--muted)',
  },
  dayHeader: {
    fontFamily: 'var(--font-heading)',
    fontSize: '11px',
    lineHeight: '1.2',
    fontWeight: 600,
    color: 'var(--muted)',
    textAlign: 'center',
    padding: '4px 0',
  },
  row: {
    display: 'contents',
  },
  hourLabel: {
    fontSize: '11px',
    lineHeight: '11px',
    fontWeight: 500,
    color: 'var(--muted)',
    marginTop: '-5px',
    textAlign: 'right',
    paddingRight: '4px',
    alignSelf: 'start',
  },
  slot: {
    minHeight: '28px',
    borderRadius: '5px',
    background: 'var(--surface)',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    background: 'rgba(20, 22, 27, 0.5)',
  },
  card: {
    maxWidth: '380px',
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: '16px',
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
  },
  cardTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: 700,
    margin: 0,
  },
  cardDescription: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--text-2)',
    margin: 0,
  },
  primaryButton: {
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid var(--amber)',
    background: 'var(--amber)',
    color: '#1A1203',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
  },
  secondaryButton: {
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  },
  howItWorks: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  howItWorksTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '16px',
    fontWeight: 700,
    margin: 0,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stepNumber: {
    flex: '0 0 28px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-heading)',
    fontSize: '13px',
    fontWeight: 700,
    color: 'var(--mint)',
  },
  stepText: {
    fontSize: '14px',
    fontWeight: 500,
  },
};
