import { describe, it, expect } from 'vitest';
import { expandRule, utcToLocal } from './timeEngine';

describe('DST group — local time stays at wall-clock', () => {
  it('Tuesday 20:00 in Amsterdam is 20:00 local, not shifted by server tz', () => {
    const rule = {
      id: 1, user_id: 'u1', weekdays: [2], start_time: '20:00', end_time: '23:00',
      tz: 'Europe/Amsterdam', valid_from: 0, valid_to: null,
    };
    const occ = expandRule(rule, Date.parse('2026-10-27T00:00:00+02:00'), Date.parse('2026-11-03T00:00:00+01:00'));
    expect(occ.length).toBeGreaterThan(0);
    // The UTC instant should reflect the DST offset (CET / CEST shift on different weekends)
    const startUtc = occ[0].start;
    const localBack = utcToLocal(startUtc, 'Europe/Amsterdam');
    expect(localBack.time).toBe('20:00');
  });

  it('Tuesday 20:00 in New York stays at 20:00 NY time even when DST switches', () => {
    const rule = {
      id: 2, user_id: 'u2', weekdays: [2], start_time: '20:00', end_time: '23:00',
      tz: 'America/New_York', valid_from: 0, valid_to: null,
    };
    const occ = expandRule(rule, Date.parse('2026-11-01T00:00:00-05:00'), Date.parse('2026-11-08T00:00:00-05:00'));
    expect(occ.length).toBe(1);
    const localBack = utcToLocal(occ[0].start, 'America/New_York');
    expect(localBack.time).toBe('20:00');
  });
});
