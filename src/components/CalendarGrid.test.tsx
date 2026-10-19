import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarGrid, CalendarWeek } from './CalendarGrid';

describe('CalendarGrid key fix', () => {
  const mockWeek: CalendarWeek = {
    weekStart: new Date('2025-01-06T00:00:00Z'),
    weekEnd: new Date('2025-01-12T00:00:00Z'),
    slots: [
      {
        timestamp: new Date('2025-01-06T17:00:00Z').getTime(),
        count: 2,
        dayIndex: 0,
        hourMinute: '17:00',
        freeFriends: ['Alice', 'Bob'],
      },
      {
        timestamp: new Date('2025-01-07T18:30:00Z').getTime(),
        count: 1,
        dayIndex: 1,
        hourMinute: '18:30',
        freeFriends: ['Alice'],
      },
    ],
  };

  const baseProps = {
    timezone: 'UTC',
    onPrevWeek: () => {},
    onNextWeek: () => {},
  };

  it('renders the 7 day headers', () => {
    render(<CalendarGrid weekData={mockWeek} {...baseProps} />);
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      expect(screen.getAllByText(new RegExp('^' + day + ' \\d+$'))).toHaveLength(1);
    }
  });

  it('renders without duplicate React key warnings', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<CalendarGrid weekData={mockWeek} {...baseProps} />);
    const dup = errSpy.mock.calls.filter(
      ([msg]) => typeof msg === 'string' && msg.includes('Encountered two children')
    );
    expect(dup).toHaveLength(0);
    errSpy.mockRestore();
  });

  it('full 7-day grid (98 slots) still has unique keys', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const slots = [];
    for (let day = 0; day < 7; day++) {
      for (let h = 17; h < 24; h++) {
        for (const m of [0, 30]) {
          slots.push({
            timestamp: new Date(2025, 0, 6 + day, h, m, 0).getTime(),
            count: (h * 60 + m) % 3,
            dayIndex: day,
            hourMinute: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          });
        }
      }
    }
    const week: CalendarWeek = {
      weekStart: new Date('2025-01-06T00:00:00Z'),
      weekEnd: new Date('2025-01-12T00:00:00Z'),
      slots,
    };
    const { container } = render(<CalendarGrid weekData={week} {...baseProps} />);
    // 14 time rows x 7 days = 98 slot buttons
    expect(container.querySelectorAll('.calendar-slot')).toHaveLength(98);
    const dup = errSpy.mock.calls.filter(
      ([msg]) => typeof msg === 'string' && msg.includes('Encountered two children')
    );
    expect(dup).toHaveLength(0);
    errSpy.mockRestore();
  });

  it('slot keys are stable across re-renders (no remount of DOM nodes)', () => {
    const { container, rerender } = render(<CalendarGrid weekData={mockWeek} {...baseProps} />);
    const before = container.querySelectorAll('.calendar-slot');
    const firstNode = before[0];
    rerender(
      <CalendarGrid
        weekData={{ ...mockWeek, slots: [...mockWeek.slots].reverse() }}
        {...baseProps}
      />
    );
    const after = container.querySelectorAll('.calendar-slot');
    // Same DOM node reused => React keys are stable
    expect(after[0]).toBe(firstNode);
  });

  it('renders slot counts and disables empty slots', () => {
    const { container } = render(<CalendarGrid weekData={mockWeek} {...baseProps} />);
    const enabled = container.querySelectorAll('.calendar-slot:not([disabled])');
    // Only the two slots with count > 0 are enabled
    expect(enabled).toHaveLength(2);
    const labels = Array.from(container.querySelectorAll('.calendar-slot')).map((el) =>
      el.getAttribute('aria-label')
    );
    expect(labels.some((l) => l && l.includes('2 friends available'))).toBe(true);
    expect(labels.some((l) => l && l.includes('1 friend available'))).toBe(true);
  });
});
