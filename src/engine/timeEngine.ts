export interface Rule {
  id: number;
  user_id: string;
  weekdays: number[]; // 1=Mon, 7=Sun
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  tz: string; // IANA timezone
  valid_from: number; // Unix ms (local date midnight in rule's tz)
  valid_to: number | null; // Unix ms (local date midnight in rule's tz), null = no end
}

export interface Exception {
  id: number;
  user_id: string;
  rule_id: number | null; // null for extra one-time slots
  local_date: string; // YYYY-MM-DD in rule owner's timezone
  type: 'cancelled' | 'changed' | 'extra';
  start_time: string | null; // HH:MM for changed/extra
  end_time: string | null; // HH:MM for changed/extra
}

export interface EffectiveWindow {
  start: number; // Unix ms in UTC
  end: number; // Unix ms in UTC
  source: 'rule' | 'exception';
  rule_id: number;
  exception_id?: number;
  status: 'usual' | 'changed' | 'extra';
}

// Calendar constants
export const CALENDAR_START_HOUR = 17; // 17:00
export const CALENDAR_END_HOUR = 24; // 24:00 (midnight)
export const SLOT_MINUTES = 30;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
export const TOTAL_SLOTS = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * SLOTS_PER_HOUR; // 14 slots

export const TONIGHT_WINDOW_HOURS = 3;

/**
 * Parse HH:MM time string to minutes since midnight
 */
export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid time format: ' + timeStr);
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time format: ' + timeStr);
  }
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if a time range crosses midnight
 */
export function crossesMidnight(startMinutes: number, endMinutes: number): boolean {
  return endMinutes <= startMinutes;
}

/**
 * Get the start of day (midnight) in a specific timezone as UTC timestamp
 */
export function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
  return localDate.getTime() - utcDate.getTime();
}

export function getDayStartInTimezone(date: Date, timezone: string): number {
  const dateStr = date.toLocaleDateString('en-CA', { timeZone: timezone }); // YYYY-MM-DD
  const midnightInTz = new Date(dateStr + 'T00:00:00');

  const offsetMs = getTimezoneOffsetMs(midnightInTz, timezone);
  return midnightInTz.getTime() - offsetMs;
}

export function localToUtc(localDateStr: string, timeStr: string, timezone: string): number {
  // Interpret `localDateStr timeStr` as wall-clock in `timezone` and return the UTC timestamp.
  // `new Date(iso)` parses the wall-clock as system-local time; re-reading that instant in
  // `timezone` derives the target offset without assuming the system timezone.
  const wall = new Date(`${localDateStr}T${timeStr}:00`);
  const wallInTarget = new Date(wall.toLocaleString('en-US', { timeZone: timezone }));
  return 2 * wall.getTime() - wallInTarget.getTime();
}

/**
 * Convert UTC timestamp to local time components in a timezone
 */
export function utcToLocal(
  utcMs: number,
  timezone: string
): { date: string; time: string; offsetMinutes: number } {
  const date = new Date(utcMs);

  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }); // YYYY-MM-DD
  const dateStr = formatter.format(date);

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const timeStr = timeFormatter.format(date);

  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMinutes = (date.getTime() - utcDate.getTime()) / (1000 * 60);

  return { date: dateStr, time: timeStr, offsetMinutes };
}

/**
 * Expand a rule into occurrences within a date range
 */
export function expandRule(
  rule: Rule,
  rangeStart: number, // UTC ms
  rangeEnd: number // UTC ms
): Array<{ start: number; end: number; localDate: string }> {
  const occurrences: Array<{ start: number; end: number; localDate: string }> = [];

  const startMinutes = parseTime(rule.start_time);
  const endMinutes = parseTime(rule.end_time);

  if (crossesMidnight(startMinutes, endMinutes)) {
    throw new Error(`Rule ${rule.id}: times cannot cross midnight. Use two ranges.`);
  }

  // Convert range to rule's timezone to find relevant dates
  const rangeStartLocal = utcToLocal(rangeStart, rule.tz);
  const rangeEndLocal = utcToLocal(rangeEnd, rule.tz);

  const startDate = new Date(rangeStartLocal.date);
  const endDate = new Date(rangeEndLocal.date);

  // Check rule validity

  // Iterate through each day in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const weekday = currentDate.getDay(); // 0=Sun, 6=Sat
    const isoWeekday = weekday === 0 ? 7 : weekday; // 1=Mon, 7=Sun

    if (rule.weekdays.includes(isoWeekday)) {
      const localDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const localDateMs = new Date(`${localDateStr}T00:00:00`).getTime();

      // Check if within rule validity
      if (!rule.valid_to || localDateMs <= rule.valid_to) {
        const startUtc = localToUtc(localDateStr, rule.start_time, rule.tz);
        const endUtc = localToUtc(localDateStr, rule.end_time, rule.tz);

        // Check if within query range
        if (startUtc < rangeEnd && endUtc > rangeStart) {
          occurrences.push({ start: startUtc, end: endUtc, localDate: localDateStr });
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return occurrences;
}

/**
 * Apply exceptions to occurrences and produce effective windows
 */
export function applyExceptions(
  occurrences: Array<{ start: number; end: number; localDate: string; rule_id: number }>,
  exceptions: Exception[],
  ruleTz: string
): EffectiveWindow[] {
  const effective: EffectiveWindow[] = [];
  const exceptionMap = new Map<string, Exception[]>();

  // Group exceptions by local date
  for (const exc of exceptions) {
    if (!exceptionMap.has(exc.local_date)) {
      exceptionMap.set(exc.local_date, []);
    }
    exceptionMap.get(exc.local_date)!.push(exc);
  }

  for (const occ of occurrences) {
    const dateExceptions = exceptionMap.get(occ.localDate) || [];

    // Check for cancelled
    const cancelled = dateExceptions.find(
      (e) => e.type === 'cancelled' && e.rule_id === occ.rule_id
    );
    if (cancelled) {
      continue; // Skip this occurrence
    }

    // Check for changed
    const changed = dateExceptions.find((e) => e.type === 'changed' && e.rule_id === occ.rule_id);
    if (changed && changed.start_time && changed.end_time) {
      const startUtc = localToUtc(occ.localDate, changed.start_time, ruleTz);
      const endUtc = localToUtc(occ.localDate, changed.end_time, ruleTz);
      effective.push({
        start: startUtc,
        end: endUtc,
        source: 'exception',
        rule_id: occ.rule_id,
        exception_id: changed.id,
        status: 'changed',
      });
      continue;
    }

    // Normal occurrence
    effective.push({
      start: occ.start,
      end: occ.end,
      source: 'rule',
      rule_id: occ.rule_id,
      status: 'usual',
    });
  }

  // Add extra one-time slots
  for (const exc of exceptions) {
    if (exc.type === 'extra' && exc.start_time && exc.end_time && exc.rule_id === null) {
      const startUtc = localToUtc(exc.local_date, exc.start_time, ruleTz);
      const endUtc = localToUtc(exc.local_date, exc.end_time, ruleTz);
      effective.push({
        start: startUtc,
        end: endUtc,
        source: 'exception',
        rule_id: -1, // Extra slots don't have a rule
        exception_id: exc.id,
        status: 'extra',
      });
    }
  }

  return effective;
}

/**
 * Snap a UTC timestamp to the nearest 30-minute slot boundary in the viewer's timezone
 * Snaps inward (floor for start, ceil for end)
 */
export function snapToSlot(utcMs: number, timezone: string, isStart: boolean): number {
  const local = utcToLocal(utcMs, timezone);
  const minutes = parseTime(local.time);

  let snappedMinutes: number;
  if (isStart) {
    // Floor to nearest slot
    snappedMinutes = Math.floor(minutes / SLOT_MINUTES) * SLOT_MINUTES;
  } else {
    // Ceil to nearest slot
    snappedMinutes = Math.ceil(minutes / SLOT_MINUTES) * SLOT_MINUTES;
  }

  // Handle edge case where ceil goes to next day
  if (!isStart && snappedMinutes === 24 * 60) {
    snappedMinutes = 0;
    // Would need to increment date, but for our calendar range (17:00-24:00) this shouldn't happen
  }

  const snappedTimeStr = formatTime(snappedMinutes);
  return localToUtc(local.date, snappedTimeStr, timezone);
}

/**
 * Convert effective windows to 30-minute slot counts in viewer's timezone
 */
export function windowsToSlots(
  windows: EffectiveWindow[],
  timezone: string,
  rangeStart: number,
  rangeEnd: number
): Map<number, number> {
  const slotCounts = new Map<number, number>();

  // Calculate calendar range in viewer's timezone
  const rangeStartLocal = utcToLocal(rangeStart, timezone);
  const rangeEndLocal = utcToLocal(rangeEnd, timezone);

  const startDate = new Date(rangeStartLocal.date);
  const endDate = new Date(rangeEndLocal.date);

  // For each day in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const localDateStr = currentDate.toISOString().split('T')[0];

    // Create slots for this day (17:00-24:00)
    for (let slot = 0; slot < TOTAL_SLOTS; slot++) {
      const slotStartMinutes = CALENDAR_START_HOUR * 60 + slot * SLOT_MINUTES;
      const slotEndMinutes = slotStartMinutes + SLOT_MINUTES;

      const slotStartUtc = localToUtc(localDateStr, formatTime(slotStartMinutes), timezone);
      const slotEndUtc = localToUtc(localDateStr, formatTime(slotEndMinutes), timezone);

      // Count windows overlapping this slot
      let count = 0;
      for (const window of windows) {
        if (window.start < slotEndUtc && window.end > slotStartUtc) {
          count++;
        }
      }

      if (count > 0) {
        slotCounts.set(slotStartUtc, count);
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slotCounts;
}

/**
 * Compute "Tonight" - friends free in the next 3 hours
 */
export function computeTonight(
  windows: EffectiveWindow[],
  _timezone: string,
  now: number = Date.now()
): EffectiveWindow[] {
  const windowEnd = now + TONIGHT_WINDOW_HOURS * 60 * 60 * 1000;

  return windows
    .filter((w) => w.start < windowEnd && w.end > now)
    .sort((a, b) => a.start - b.start);
}

/**
 * Main function: compute availability for a set of users
 */
export interface UserAvailability {
  user_id: string;
  rules: Rule[];
  exceptions: Exception[];
}

export interface AvailabilityResult {
  slotCounts: Map<number, number>; // UTC slot start -> count
  tonight: EffectiveWindow[];
  userWindows: Map<string, EffectiveWindow[]>; // user_id -> their windows
}

export function computeAvailability(
  users: UserAvailability[],
  timezone: string,
  rangeStart: number,
  rangeEnd: number
): AvailabilityResult {
  const allWindows: EffectiveWindow[] = [];
  const userWindows = new Map<string, EffectiveWindow[]>();

  for (const user of users) {
    const userEffective: EffectiveWindow[] = [];

    for (const rule of user.rules) {
      const occurrences = expandRule(rule, rangeStart, rangeEnd);
      const withRuleId = occurrences.map((o) => ({ ...o, rule_id: rule.id }));
      const effective = applyExceptions(withRuleId, user.exceptions, rule.tz);
      userEffective.push(...effective);
      allWindows.push(...effective);
    }

    userWindows.set(user.user_id, userEffective);
  }

  const slotCounts = windowsToSlots(allWindows, timezone, rangeStart, rangeEnd);
  const tonight = computeTonight(allWindows, timezone);

  return { slotCounts, tonight, userWindows };
}
