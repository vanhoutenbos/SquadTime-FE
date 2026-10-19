import { describe, it, expect } from 'vitest';
import {
  Rule,
  Exception,
  parseTime,
  formatTime,
  crossesMidnight,
  expandRule,
  applyExceptions,
  localToUtc,
  utcToLocal,
} from './timeEngine';

describe('timeEngine', () => {
  describe('parseTime and formatTime', () => {
    it('parses HH:MM correctly', () => {
      expect(parseTime('00:00')).toBe(0);
      expect(parseTime('09:30')).toBe(570);
      expect(parseTime('17:00')).toBe(1020);
      expect(parseTime('23:30')).toBe(1410);
    });

    it('formats minutes to HH:MM', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(570)).toBe('09:30');
      expect(formatTime(1020)).toBe('17:00');
      expect(formatTime(1410)).toBe('23:30');
    });

    it('throws for invalid times', () => {
      expect(() => parseTime('24:00')).toThrow();
      expect(() => parseTime('12:60')).toThrow();
      expect(() => parseTime('abc')).toThrow();
    });
  });

  describe('crossesMidnight', () => {
    it('returns false for normal ranges', () => {
      expect(crossesMidnight(1020, 1380)).toBe(false);
    });

    it('returns true for over-midnight ranges', () => {
      expect(crossesMidnight(1380, 60)).toBe(true);
      expect(crossesMidnight(22 * 60, 2 * 60)).toBe(true);
      expect(crossesMidnight(0, 0)).toBe(true);
    });
  });

  describe('expandRule', () => {
    it('expands a simple weekly rule in a date range', () => {
      const rule: Rule = {
        id: 1,
        user_id: 'user1',
        weekdays: [1],
        start_time: '20:00',
        end_time: '23:00',
        tz: 'Europe/Amsterdam',
        valid_from: Date.parse('2025-10-13T00:00:00+02:00'),
        valid_to: null,
      };
      const rangeStart = Date.parse('2025-10-13T00:00:00+02:00');
      const rangeEnd = Date.parse('2025-10-20T00:00:00+02:00');
      const occ = expandRule(rule, rangeStart, rangeEnd);
      expect(occ.length).toBe(1);
    });

    it('rejects rules crossing midnight', () => {
      const rule: Rule = {
        id: 1,
        user_id: 'user1',
        weekdays: [1],
        start_time: '23:00',
        end_time: '01:00',
        tz: 'Europe/Amsterdam',
        valid_from: Date.parse('2025-10-13T00:00:00+02:00'),
        valid_to: null,
      };
      const rangeStart = Date.parse('2025-10-13T00:00:00+02:00');
      const rangeEnd = Date.parse('2025-10-20T00:00:00+02:00');
      expect(() => expandRule(rule, rangeStart, rangeEnd)).toThrow(/cannot cross midnight/);
    });
  });

  describe('applyExceptions - comprehensive', () => {
    it('applies cancelled exception', () => {
      const base = new Date('2025-10-15T20:00:00+02:00').getTime();
      const occurrences = [
        { start: base, end: base + 3600000, localDate: '2025-10-15', rule_id: 1 },
      ];
      const exceptions: Exception[] = [
        {
          id: 1,
          user_id: 'u1',
          rule_id: 1,
          local_date: '2025-10-15',
          type: 'cancelled',
          start_time: null,
          end_time: null,
        },
      ];
      const result = applyExceptions(
        occurrences as Array<{ start: number; end: number; localDate: string; rule_id: number }>,
        exceptions,
        'Europe/Amsterdam'
      );
      expect(result.length).toBe(0);
    });

    it('applies changed exception', () => {
      const base = new Date('2025-10-15T20:00:00+02:00').getTime();
      const occurrences = [
        { start: base, end: base + 2 * 3600000, localDate: '2025-10-15', rule_id: 1 },
      ];
      const exceptions: Exception[] = [
        {
          id: 1,
          user_id: 'u1',
          rule_id: 1,
          local_date: '2025-10-15',
          type: 'changed',
          start_time: '19:30',
          end_time: '21:30',
        },
      ];
      const result = applyExceptions(
        occurrences as Array<{ start: number; end: number; localDate: string; rule_id: number }>,
        exceptions,
        'Europe/Amsterdam'
      );
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('changed');
    });

    it('adds extra slots', () => {
      const occurrences: Array<{ start: number; end: number; localDate: string; rule_id: number }> =
        [];
      const exceptions: Exception[] = [
        {
          id: 1,
          user_id: 'u1',
          rule_id: null,
          local_date: '2025-10-15',
          type: 'extra',
          start_time: '19:30',
          end_time: '21:30',
        },
      ];
      const result = applyExceptions(
        occurrences as Array<{ start: number; end: number; localDate: string; rule_id: number }>,
        exceptions,
        'Europe/Amsterdam'
      );
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('extra');
    });
  });

  describe('DST and timezone cases', () => {
    it('handles Europe/Amsterdam DST end scenario', () => {
      const rule: Rule = {
        id: 1,
        user_id: 'u1',
        weekdays: [7],
        start_time: '20:00',
        end_time: '23:00',
        tz: 'Europe/Amsterdam',
        valid_from: Date.parse('2026-10-25T00:00:00+02:00'),
        valid_to: null,
      };
      const rangeStart = Date.parse('2026-10-25T00:00:00+02:00');
      const rangeEnd = Date.parse('2026-11-01T00:00:00+01:00');
      const occ = expandRule(rule, rangeStart, rangeEnd);
      expect(occ.length).toBeGreaterThan(0);
    });

    it('handles Asia/Tokyo (no DST)', () => {
      const rule: Rule = {
        id: 1,
        user_id: 'u1',
        weekdays: [1],
        start_time: '20:00',
        end_time: '23:00',
        tz: 'Asia/Tokyo',
        valid_from: Date.parse('2025-10-13T00:00:00+09:00'),
        valid_to: null,
      };
      const rangeStart = Date.parse('2025-10-13T00:00:00+09:00');
      const rangeEnd = Date.parse('2025-10-20T00:00:00+09:00');
      const occ = expandRule(rule, rangeStart, rangeEnd);
      expect(occ.length).toBe(1);
    });

    it('handles Asia/Kolkata (+05:30)', () => {
      const rule: Rule = {
        id: 1,
        user_id: 'u1',
        weekdays: [1],
        start_time: '20:00',
        end_time: '23:00',
        tz: 'Asia/Kolkata',
        valid_from: Date.parse('2025-10-13T00:00:00+05:30'),
        valid_to: null,
      };
      const rangeStart = Date.parse('2025-10-13T00:00:00+05:30');
      const rangeEnd = Date.parse('2025-10-20T00:00:00+05:30');
      const occ = expandRule(rule, rangeStart, rangeEnd);
      expect(occ.length).toBe(1);
    });
  });

  describe('localToUtc and utcToLocal round-trip', () => {
    it('converts wall-clock in a timezone to the correct UTC instant', () => {
      // 2026-10-18 is in CEST (UTC+2): 20:00 local = 18:00 UTC
      expect(localToUtc('2026-10-18', '20:00', 'Europe/Amsterdam')).toBe(
        Date.parse('2026-10-18T18:00:00Z')
      );
      // 2026-01-18 is in CET (UTC+1): 20:00 local = 19:00 UTC
      expect(localToUtc('2026-01-18', '20:00', 'Europe/Amsterdam')).toBe(
        Date.parse('2026-01-18T19:00:00Z')
      );
      // EDT (UTC-4): 20:00 local = 00:00 UTC next day
      expect(localToUtc('2026-07-18', '20:00', 'America/New_York')).toBe(
        Date.parse('2026-07-19T00:00:00Z')
      );
      // JST (UTC+9): 20:00 local = 11:00 UTC
      expect(localToUtc('2026-01-18', '20:00', 'Asia/Tokyo')).toBe(
        Date.parse('2026-01-18T11:00:00Z')
      );
    });

    it('round-trips through utcToLocal back to the original wall-clock time', () => {
      const cases: Array<[string, string, string]> = [
        ['2026-10-18', '20:00', 'Europe/Amsterdam'],
        ['2026-07-18', '20:00', 'America/New_York'],
        ['2026-06-18', '20:00', 'Asia/Kolkata'],
      ];
      for (const [date, time, tz] of cases) {
        const utc = localToUtc(date, time, tz);
        expect(utcToLocal(utc, tz).time).toBe(time);
      }
    });
  });
});
