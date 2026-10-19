import { CalendarSlot, CalendarWeek } from './CalendarGrid';
import { TonightFriend } from './TonightCard';
import { Friend } from './FriendsPanel';
import { User } from '../hooks/useAuth';

export type { CalendarSlot, CalendarWeek, TonightFriend, Friend };

export const MOCK_PATTERN = [
  [0, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 1, 1, 1],
  [0, 1, 1, 0, 1, 2, 2],
  [0, 1, 1, 1, 1, 2, 2],
  [1, 1, 2, 1, 2, 3, 3],
  [1, 2, 2, 1, 2, 3, 3],
  [2, 3, 3, 2, 4, 3, 4],
  [2, 3, 3, 2, 4, 4, 4],
  [2, 4, 3, 2, 5, 4, 4],
  [2, 4, 3, 2, 5, 4, 4],
  [1, 3, 2, 1, 5, 4, 3],
  [1, 3, 2, 1, 5, 3, 3],
  [0, 1, 1, 0, 3, 3, 1],
  [0, 1, 1, 0, 3, 2, 1],
];

export function buildMockWeek(offset: number): CalendarWeek {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset + offset * 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const slots: CalendarSlot[] = [];
  MOCK_PATTERN.forEach((dayCounts, slotIdx) => {
    const hour = 17 + Math.floor(slotIdx / 2);
    const minute = (slotIdx % 2) * 30;
    const hourMinute = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    dayCounts.forEach((count, dayIdx) => {
      const slotDate = new Date(weekStart);
      slotDate.setDate(weekStart.getDate() + dayIdx);
      slotDate.setHours(hour, minute, 0, 0);
      slots.push({ timestamp: slotDate.getTime(), count, dayIndex: dayIdx, hourMinute });
    });
  });
  return { weekStart, weekEnd, slots };
}

export function buildMockTonight(): {
  friends: TonightFriend[];
  bestTimeSlot: { day: string; timeRange: string; count: number; totalSharing: number } | null;
} {
  const now = new Date();
  const currentHour = now.getHours();
  const tonightFriends: TonightFriend[] = [];
  if (currentHour >= 19 && currentHour < 24) {
    tonightFriends.push({
      name: 'Mara',
      initials: 'MA',
      localTime: '21:00',
      isAvailableNow: currentHour >= 21,
    });
    tonightFriends.push({
      name: 'Joeri',
      initials: 'JO',
      localTime: '21:00',
      isAvailableNow: currentHour >= 21,
    });
    if (currentHour >= 20) {
      tonightFriends.push({
        name: 'Priya',
        initials: 'PR',
        localTime: '20:00',
        timezone: 'London',
        isAvailableNow: currentHour >= 21,
      });
    }
  }
  const bestTimeSlot = { day: 'Fri', timeRange: '21:00 – 23:00', count: 5, totalSharing: 5 };
  return { friends: tonightFriends, bestTimeSlot };
}

export function buildMockFriends(
  demoFriends: User[],
  friendsVisibility: Record<string, boolean>
): Friend[] {
  return demoFriends.map((df) => ({
    id: df.discord_id,
    displayName: df.display_name,
    initials: df.display_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
    timezone: df.timezone,
    nextFreeTime: 'tonight 20:00',
    isSharing: df.sharing,
    isOnSquadTime: true,
    showInCalendar: friendsVisibility[df.discord_id] !== false,
  }));
}
