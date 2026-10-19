export interface Friend {
  id: string;
  displayName: string;
  initials: string;
  timezone: string;
  nextFreeTime?: string; // e.g., "tonight 20:00" or "Fri 20:00"
  isSharing: boolean;
  isOnSquadTime: boolean;
  showInCalendar?: boolean;
}

interface FriendsPanelProps {
  friends: Friend[];
  onToggleShowInCalendar?: (friendId: string, show: boolean) => void;
  onInviteFriend?: (friendId: string) => void;
  onInviteNew?: () => void;
}

export function FriendsPanel({
  friends,
  onToggleShowInCalendar,
  onInviteFriend,
  onInviteNew,
}: FriendsPanelProps) {
  const onSquadTime = friends.filter((f) => f.isOnSquadTime);
  const notOnSquadTime = friends.filter((f) => !f.isOnSquadTime);
  const sharingCount = onSquadTime.filter((f) => f.isSharing).length;

  const getTimezoneOffset = (friendTz: string, userTz: string = 'UTC') => {
    try {
      const now = new Date();
      const friendDate = new Date(now.toLocaleString('en-US', { timeZone: friendTz }));
      const userDate = new Date(now.toLocaleString('en-US', { timeZone: userTz }));
      const diffHours = (friendDate.getTime() - userDate.getTime()) / (1000 * 60 * 60);

      if (diffHours === 0) return null;
      const sign = diffHours > 0 ? '+' : '';
      return `${sign}${Math.round(diffHours)}h`;
    } catch {
      return null;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Friends</div>
          <div style={styles.subtitle}>
            {friends.length} friend{friends.length !== 1 ? 's' : ''} · {sharingCount} sharing
          </div>
        </div>
        <button onClick={onInviteNew} style={styles.inviteButton}>
          Invite friends
        </button>
      </div>

      {/* Column label */}
      <div style={styles.columnLabel}>Show in calendar</div>

      {/* Friends list */}
      <div style={styles.friendsList}>
        {onSquadTime.map((friend) => (
          <label key={friend.id} style={styles.friendRow}>
            <span style={styles.friendAvatar}>
              {friend.initials || getInitials(friend.displayName)}
            </span>
            <span style={styles.friendInfo}>
              <span style={styles.friendName}>{friend.displayName}</span>
              <span style={styles.friendMeta}>
                {friend.timezone.split('/').pop()}
                {getTimezoneOffset(friend.timezone) && ` · ${getTimezoneOffset(friend.timezone)}`}
                {friend.nextFreeTime && ` · next free ${friend.nextFreeTime}`}
              </span>
            </span>
            <input
              type="checkbox"
              checked={friend.showInCalendar !== false}
              onChange={(e) => onToggleShowInCalendar?.(friend.id, e.target.checked)}
              aria-label={`Show ${friend.displayName}`}
              style={styles.checkbox}
            />
          </label>
        ))}
      </div>

      {/* Not on SquadTime yet */}
      {notOnSquadTime.map((friend) => (
        <div key={friend.id} style={styles.notOnSquadTimeRow}>
          <span style={styles.notOnSquadTimeAvatar}>
            {friend.initials || getInitials(friend.displayName)}
          </span>
          <span style={styles.friendInfo}>
            <span style={styles.notOnSquadTimeName}>{friend.displayName}</span>
            <span style={styles.friendMeta}>Not on SquadTime yet</span>
          </span>
          <button onClick={() => onInviteFriend?.(friend.id)} style={styles.inviteSmallButton}>
            Invite
          </button>
        </div>
      ))}

      {/* Community link */}
      <div style={styles.communityFooter}>
        <span style={styles.communityText}>Join our community</span>
        <a
          href="https://discord.gg/XmzRNm9N6Y"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.communityLink}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.764-.693 1.163a19.277 19.277 0 0 0-5.425 0 12.62 12.62 0 0 0-.695-1.163.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.68 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.994 6.267.077.077 0 0 0 .084-.028c.464-.613.977-1.217 1.483-1.847a.077.077 0 0 1 .085-.001 13.294 13.294 0 0 0 1.635 1.543.074.074 0 0 0 .084.028c2.651-1.636 5.128-3.595 6.967-5.071a.077.077 0 0 0 .083-.028.07.07 0 0 0 .031-.057c.423-4.627-.472-9.226-3.548-13.66a.061.061 0 0 0-.032-.027zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418z" />
          </svg>
          Discord Community
        </a>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: '1 1 280px',
    maxWidth: '340px',
    boxSizing: 'border-box',
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '0 4px 4px',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '16px',
    fontWeight: 700,
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--muted)',
  },
  inviteButton: {
    minHeight: '44px',
    padding: '0 10px',
    border: '0',
    background: 'transparent',
    color: 'var(--muted)',
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  columnLabel: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 14px',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--muted)',
  },
  friendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  friendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: '56px',
    padding: '6px 10px',
    borderRadius: '10px',
    background: 'var(--surface)',
    cursor: 'pointer',
  },
  friendAvatar: {
    flex: '0 0 36px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
  },
  friendInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  friendName: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
  },
  friendMeta: {
    display: 'block',
    fontSize: '12px',
    color: 'var(--muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  checkbox: {
    accentColor: 'var(--mint)',
    width: '20px',
    height: '20px',
    margin: 0,
    cursor: 'pointer',
  },
  notOnSquadTimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: '56px',
    padding: '6px 10px',
    borderRadius: '10px',
    border: '1px dashed var(--border-strong)',
  },
  notOnSquadTimeAvatar: {
    flex: '0 0 36px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px dashed #5C6370',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    boxSizing: 'border-box',
  },
  notOnSquadTimeName: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-2)',
  },
  inviteSmallButton: {
    minHeight: 44,
    padding: '0 14px',
    borderRadius: 8,
    border: '1px solid var(--mint)',
    background: 'transparent',
    color: 'var(--mint)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  communityFooter: {
    marginTop: 8,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px dashed var(--border-strong)',
    background: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    textAlign: 'center',
  },
  communityText: {
    fontSize: 12,
    color: 'var(--muted)',
  },
  communityLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--mint)',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },
};
