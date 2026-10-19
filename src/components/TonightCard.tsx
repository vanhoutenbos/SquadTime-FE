export interface TonightFriend {
  name: string;
  initials: string;
  localTime: string;
  timezone?: string;
  isAvailableNow: boolean;
}

interface TonightCardProps {
  friends: TonightFriend[];
  bestTimeSlot?: {
    day: string;
    timeRange: string;
    count: number;
    totalSharing: number;
  } | null;
  onSeeThisEvening?: () => void;
}

export function TonightCard({ friends, bestTimeSlot, onSeeThisEvening }: TonightCardProps) {
  const availableNow = friends.filter((f) => f.isAvailableNow);
  const availableSoon = friends.filter((f) => !f.isAvailableNow);

  // If no one is available, don't show the card
  if (friends.length === 0 && !bestTimeSlot) {
    return null;
  }

  return (
    <div style={styles.container}>
      {bestTimeSlot && (
        <>
          <div>
            <div style={styles.label}>Best time this week</div>
            <div style={styles.titleRow}>
              <span style={styles.title}>
                {bestTimeSlot.day} {bestTimeSlot.timeRange}
              </span>
              <span style={styles.count}>
                {bestTimeSlot.count === bestTimeSlot.totalSharing
                  ? `All ${bestTimeSlot.totalSharing} friends who share are free`
                  : `${bestTimeSlot.count} of ${bestTimeSlot.totalSharing} friends free`}
              </span>
            </div>
          </div>
          {onSeeThisEvening && (
            <button onClick={onSeeThisEvening} style={styles.button}>
              See this evening
            </button>
          )}
        </>
      )}

      {friends.length > 0 && (
        <>
          {bestTimeSlot && <div style={styles.divider} />}

          <div>
            <div style={styles.sectionLabel}>Their local times:</div>

            {availableNow.length > 0 && (
              <div style={styles.nowSection}>
                <div style={styles.nowBadge}>FREE NOW</div>
                <div style={styles.friendsGrid}>
                  {availableNow.map((friend, idx) => (
                    <span key={idx} style={styles.friendPill}>
                      {friend.name} · {friend.localTime}
                      {friend.timezone && ` (${friend.timezone})`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {availableSoon.length > 0 && (
              <div style={styles.friendsGrid}>
                {availableSoon.map((friend, idx) => (
                  <span key={idx} style={styles.friendPill}>
                    {friend.name} · {friend.localTime}
                    {friend.timezone && ` (${friend.timezone})`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderLeft: '4px solid var(--amber)',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--amber)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  titleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: '10px',
    marginTop: '4px',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '20px',
    fontWeight: 700,
  },
  count: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--mint)',
  },
  button: {
    minHeight: '44px',
    padding: '0 16px',
    borderRadius: '10px',
    border: '1px solid var(--amber)',
    background: 'transparent',
    color: 'var(--amber)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '6px 0',
  },
  sectionLabel: {
    fontSize: '12px',
    color: 'var(--muted)',
    marginBottom: '8px',
  },
  nowSection: {
    marginBottom: '12px',
  },
  nowBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '999px',
    background: 'var(--mint)',
    color: '#04120C',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  friendsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 500,
  },
  friendPill: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#232730',
    border: '1px solid var(--border)',
  },
};
