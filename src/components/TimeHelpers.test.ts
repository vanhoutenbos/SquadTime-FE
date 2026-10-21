import { describe, it, expect } from 'vitest';
import { buildUpcomingItems, formatDayMonth } from './TimeHelpers';
import { Rule, Exception } from '../engine/timeEngine';

describe('TimeHelpers', () => {
  it('buildUpcomingItems shows usual + changed + extra', () => {
    const rules: Rule[] = [
      { id: 1, user_id: 'u', weekdays: [2], start_time: '20:00', end_time: '23:00', tz: 'UTC', valid_from: 0, valid_to: null },
    ];
    const exceptions: Exception[] = [
      { id: 1, user_id: 'u', rule_id: 1, local_date: '2026-11-03', type: 'changed', start_time: '19:00', end_time: '21:00' },
      { id: 2, user_id: 'u', rule_id: null, local_date: '2026-11-05', type: 'extra', start_time: '22:00', end_time: '23:30' },
    ];
    const weekStart = Date.parse('2026-11-02T00:00:00Z');
    const weekEnd = Date.parse('2026-11-08T23:59:59Z');
    const rangeEnd = weekEnd;
    const items = buildUpcomingItems(rules, exceptions, 'UTC', weekStart, weekEnd, rangeEnd);
    const tuesday = items.find((i) => i.date === '2026-11-03');
    const friday = items.find((i) => i.date === '2026-11-05' && i.status === 'extra');
    expect(tuesday).toBeDefined();
    expect(tuesday!.status).toBe('changed');
    expect(tuesday!.start_time).toBe('19:00');
    expect(friday).toBeDefined();
  });

  it('formatDayMonth formats', () => {
    expect(formatDayMonth('2026-11-03')).toContain('Nov');
  });
});
