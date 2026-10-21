import { describe, it, expect } from 'vitest';
import { expandRule } from './timeEngine';

describe('Multiple disjoint usual times', () => {
  it('two non-overlapping rules expand together', () => {
    const r1 = { id: 1, user_id: 'u', weekdays: [2, 4], start_time: '20:00', end_time: '23:00', tz: 'UTC', valid_from: 0, valid_to: null };
    const r2 = { id: 2, user_id: 'u', weekdays: [5, 6], start_time: '18:00', end_time: '23:00', tz: 'UTC', valid_from: 0, valid_to: null };
    const rangeStart = Date.parse('2026-11-02T00:00:00Z');
    const rangeEnd = Date.parse('2026-11-08T00:00:00Z');
    const occ1 = expandRule(r1, rangeStart, rangeEnd);
    const occ2 = expandRule(r2, rangeStart, rangeEnd);
    // r1 covers Tue/Thu; r2 covers Fri/Sat inside this week
    expect(occ1.length + occ2.length).toBeGreaterThanOrEqual(4);
  });
});
