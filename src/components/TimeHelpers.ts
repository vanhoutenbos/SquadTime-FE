import { strings } from '../strings';
import { Rule, Exception } from '../engine/timeEngine';

export interface UpcomingItem {
  date: string;
  day: string;
  start_time: string;
  end_time: string;
  status: 'usual' | 'today' | 'changed' | 'cancelled' | 'extra';
  tagText?: string;
  ruleId?: number | null;
  exceptionId?: number | null;
}

export const WEEKDAYS = [
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
  { key: 7, label: 'Sun' },
];

export const STATUS_CONFIG: Record<
  string,
  { label: string; borderColor: string; textColor: string }
> = {
  usual: {
    label: strings.statusLabels.usual,
    borderColor: 'var(--border)',
    textColor: 'var(--text-2)',
  },
  today: {
    label: strings.statusLabels.today,
    borderColor: 'var(--amber)',
    textColor: 'var(--amber)',
  },
  changed: {
    label: strings.statusLabels.changed,
    borderColor: 'var(--amber)',
    textColor: 'var(--amber)',
  },
  cancelled: {
    label: strings.statusLabels.cancelled,
    borderColor: 'var(--text-2)',
    textColor: 'var(--text-2)',
  },
  extra: {
    label: strings.statusLabels.extra,
    borderColor: 'var(--mint)',
    textColor: 'var(--mint)',
  },
};

export function formatDayMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function localDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function buildUpcomingItems(
  rules: Rule[],
  exceptions: Exception[],
  _tz: string,
  weekStart: number,
  weekEnd: number,
  rangeEnd: number
): UpcomingItem[] {
  const items: UpcomingItem[] = [];
  const exceptionMap = new Map<string, Exception[]>();
  for (const exc of exceptions) {
    if (!exceptionMap.has(exc.local_date)) exceptionMap.set(exc.local_date, []);
    exceptionMap.get(exc.local_date)!.push(exc);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = localDateStr(new Date());

  const currentDate = new Date(weekStart);
  const endDate = new Date(rangeEnd);
  while (currentDate <= endDate) {
    const dateStr = localDateStr(currentDate);
    const weekday = new Date(dateStr + 'T12:00:00').getDay();
    const isoWeekday = weekday === 0 ? 7 : weekday;

    const dateExceptions = exceptionMap.get(dateStr) || [];
    const extra = dateExceptions.find((e) => e.type === 'extra' && e.rule_id === null);
    if (extra) {
      items.push({
        date: dateStr,
        day: dayNames[weekday],
        start_time: extra.start_time!,
        end_time: extra.end_time!,
        status: 'extra',
        ruleId: null,
        exceptionId: extra.id,
      });
    }

    // Usual/changed/cancelled occurrences only for the current week (Mon-Sun)
    if (currentDate.getTime() <= weekEnd) {
      for (const rule of rules) {
        if (!rule.weekdays.includes(isoWeekday)) continue;
        // The current week is the display unit: show every matching day this week.
        // Only honour an explicit end date (valid_to).
        if (rule.valid_to) {
          const toStr = localDateStr(new Date(rule.valid_to));
          if (dateStr > toStr) continue;
        }

        const cancelled = dateExceptions.find(
          (e) => e.type === 'cancelled' && e.rule_id === rule.id
        );
        const changed = dateExceptions.find((e) => e.type === 'changed' && e.rule_id === rule.id);

        if (cancelled) {
          items.push({
            date: dateStr,
            day: dayNames[weekday],
            start_time: rule.start_time,
            end_time: rule.end_time,
            status: 'cancelled',
            ruleId: rule.id,
            exceptionId: cancelled.id,
          });
        } else if (changed) {
          items.push({
            date: dateStr,
            day: dayNames[weekday],
            start_time: changed.start_time!,
            end_time: changed.end_time!,
            status: 'changed',
            tagText: dateStr === todayStr ? 'Today' : undefined,
            ruleId: rule.id,
            exceptionId: changed.id,
          });
        } else {
          items.push({
            date: dateStr,
            day: dayNames[weekday],
            start_time: rule.start_time,
            end_time: rule.end_time,
            status: dateStr === todayStr ? 'today' : 'usual',
            ruleId: rule.id,
            exceptionId: null,
          });
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}
