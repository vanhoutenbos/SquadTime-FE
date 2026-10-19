export const strings = {
  home: { title: "Who's up for a game?", primaryAction: 'Add my schedule' },
  invite: { title: 'Invite friends', copied: 'Invite message copied. Paste it in a chat.' },
  sharingOff: {
    title: 'Your calendar is hidden',
    description: "Sharing is off, so you can't see when your friends are free.",
    cta: 'Turn on sharing',
    settingsLink: 'Open Settings',
  },
  emptyState: { title: "It's quiet in here", description: 'SquadTime works best with your squad.' },
  waitlist: {
    position: 'Your spot is position {n}',
    joinCommunity: 'Join the community',
    leave: 'Leave the waitlist and delete my data',
  },
  full: { title: "We're full for today" },
  deleteAccount: {
    title: 'Delete your account?',
    keep: 'Keep my account',
    delete: 'Delete everything',
    downloadFirst: 'Download my data first',
  },
  weeklyCheck: 'Still true this week?',
  aiNote: 'This app was made with AI.',
  statusLabels: {
    usual: 'Usual',
    today: 'Today',
    changed: 'Changed',
    cancelled: 'Cancelled',
    extra: 'Extra · one time',
    sharingOff: 'Sharing off',
  },
  timezoneBanner: 'All times are converted to your timezone: {timezone} · {offset}',
} as const;

export type Strings = typeof strings;
