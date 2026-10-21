import { describe, it, expect } from 'vitest';
import { computeAvailability, UserAvailability } from './timeEngine';

describe('computeAvailability / group overlap', () => {
  it('counts overlap when two users share the same window', () => {
    const users: UserAvailability[] = [
      {
        user_id: 'a',
        rules: [{ id: 1, user_id: 'a', weekdays: [2], start_time: '20:00', end_time: '23:00', tz: 'UTC', valid_from: 0, valid_to: null }],
        exceptions: [],
      },
      {
        user_id: 'b',
        rules: [{ id: 2, user_id: 'b', weekdays: [2], start_time: '20:00', end_time: '23:00', tz: 'UTC', valid_from: 0, valid_to: null }],
        exceptions: [],
      },
    ];
    const result = computeAvailability(users, 'UTC', Date.parse('2026-11-03T00:00:00Z'), Date.parse('2026-11-04T00:00:00Z'));
    const counts = Array.from(result.slotCounts.entries()).map(([, v]) => v);
    expect(counts.some((c) => c >= 2)).toBe(true);
  });

  it('tonight includes windows overlapping now', () => {
    const now = Date.parse('2026-11-03T21:00:00Z');
    const users: UserAvailability[] = [
      { user_id: 'a', rules: [{ id: 1, user_id: 'a', weekdays: [2], start_time: '20:00', end_time: '23:00', tz: 'UTC', valid_from: 0, valid_to: null }], exceptions: [] },
    ];
    const result = computeAvailability(users, 'UTC', now, now + 3 * 3600000, now);
    expect(result.tonight.length).toBeGreaterThan(0);
  });
});
