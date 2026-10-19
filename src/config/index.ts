export const config = {
  productName: 'SquadTime',
  calendar: { startHour: 17, endHour: 24, slotMinutes: 30 },
  demo: { maxUsers: 50 },
  tonightWindowHours: 3,
  inviteTokenLifetimeDays: 14,
  discordInviteUrl: 'https://discord.gg/XmzRNm9N6Y',
} as const;

export type Config = typeof config;
