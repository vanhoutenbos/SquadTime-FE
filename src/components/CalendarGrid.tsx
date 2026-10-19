import { CALENDAR_START_HOUR, CALENDAR_END_HOUR, SLOT_MINUTES } from '../engine/timeEngine';
import { useState, useRef, useEffect } from 'react';

export interface CalendarSlot {
  timestamp: number; // UTC timestamp for slot start
  count: number; // Number of friends available
  dayIndex: number; // 0=Mon, 6=Sun
  hourMinute: string; // HH:MM
  freeFriends?: string[]; // Names of friends free in this slot
}

export interface CalendarWeek {
  weekStart: Date;
  weekEnd: Date;
  slots: CalendarSlot[];
  slotFreeFriends?: Map<number, string[]>; // UTC slot start -> friend names
}

export interface HoverCardData {
  slot: CalendarSlot;
  friends: Array<{
    name: string;
    initials: string;
    localTime: string;
    timezone?: string;
  }>;
  notFreeFriends: string[];
}

interface CalendarGridProps {
  weekData: CalendarWeek;
  timezone: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isCurrentWeek?: boolean;
  onSlotClick?: (slot: CalendarSlot) => void;
  onSlotHover?: (slot: CalendarSlot | null) => void;
  hoverCard?: HoverCardData | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${Math.floor(total / 60)
    .toString()
    .padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
};

export function CalendarGrid({
  weekData,
  timezone,
  onPrevWeek,
  onNextWeek,
  isCurrentWeek = false,
  onSlotClick,
  onSlotHover,
  hoverCard,
}: CalendarGridProps) {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSlotMouseEnter = (slot: CalendarSlot, e: React.MouseEvent) => {
    onSlotHover?.(slot);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleSlotMouseLeave = () => {
    onSlotHover?.(null);
    setMousePos(null);
  };

  const handleSlotFocus = (slot: CalendarSlot, e: React.FocusEvent<HTMLButtonElement>) => {
    onSlotHover?.(slot);
    const rect = e.target.getBoundingClientRect();
    setMousePos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  };

  const handleSlotBlur = () => {
    onSlotHover?.(null);
    setMousePos(null);
  };

  // Position the hover card near the cursor, keeping it in bounds
  useEffect(() => {
    if (!hoverCard || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    let x = (mousePos?.x ?? 0) + rect.width / 2;
    let y = (mousePos?.y ?? 0) + rect.height / 2;
    if (x + rect.width > viewportW) x = viewportW - rect.width - 8;
    if (y + rect.height > viewportH) y = viewportH - rect.height - 8;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    card.style.left = `${x}px`;
    card.style.top = `${y}px`;
  }, [hoverCard, mousePos]);

  const formatWeekRange = (start: Date, end: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    });
    const startStr = formatter.format(start);
    const endStr = formatter.format(end);
    return `${startStr} – ${endStr}`;
  };

  const getTimezoneDisplay = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || '';

    const targetDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const offsetHours = (targetDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const sign = offsetHours >= 0 ? '+' : '';
    const offsetStr = `UTC${sign}${offsetHours}`;

    return `${timezone} · ${offsetStr} (${tzName})`;
  };

  const isToday = (dayIndex: number) => {
    const today = new Date();
    const todayLocal = new Date(today.toLocaleString('en-US', { timeZone: timezone }));
    const dayOfWeek = todayLocal.getDay(); // 0=Sun, 6=Sat
    const isoWeekday = dayOfWeek === 0 ? 7 : dayOfWeek; // 1=Mon, 7=Sun
    return isoWeekday === dayIndex + 1;
  };

  const getDayDate = (dayIndex: number) => {
    const date = new Date(weekData.weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date.getDate();
  };

  const getHeatClass = (count: number, maxCount: number, levels: number) => {
    if (count <= 0) return 'c0';
    const safeMax = Math.max(1, maxCount);
    const safeLevels = Math.min(5, Math.max(1, levels));
    const step = Math.max(1, Math.ceil(safeMax / safeLevels));
    const bucket = Math.min(safeLevels, Math.ceil(count / step));
    return `c${bucket}`;
  };

  const handleSlotInteraction = (slot: CalendarSlot) => {
    onSlotClick?.(slot);
  };

  // Build grid data structure
  const totalSlots = ((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60) / SLOT_MINUTES;
  const gridRows: Array<{ hour: number; minute: number; slots: Array<CalendarSlot | null> }> = [];

  for (let i = 0; i < totalSlots; i++) {
    const hour = CALENDAR_START_HOUR + Math.floor((i * SLOT_MINUTES) / 60);
    const minute = (i * SLOT_MINUTES) % 60;
    const slots: Array<CalendarSlot | null> = [];

    for (let day = 0; day < 7; day++) {
      const slot = weekData.slots.find(
        (s) =>
          s.dayIndex === day &&
          s.hourMinute ===
            `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      );
      slots.push(slot || null);
    }

    gridRows.push({ hour, minute, slots });
  }

  const maxCount = weekData.slots.reduce((m, s) => Math.max(m, s.count), 0);
  const levels = Math.min(5, Math.max(1, maxCount));

  return (
    <div style={styles.container}>
      {/* Week navigation */}
      <div style={styles.weekNav}>
        <div style={styles.weekNavLeft}>
          {!isCurrentWeek && (
            <button onClick={onPrevWeek} aria-label="Previous week" style={styles.navButton}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          )}
          <span style={styles.weekLabel}>
            {formatWeekRange(weekData.weekStart, weekData.weekEnd)}
          </span>
          <button onClick={onNextWeek} aria-label="Next week" style={styles.navButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Timezone banner */}
      <div style={styles.timezoneBanner}>
        <span style={styles.timezoneBannerContent}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--mint)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
          </svg>
          <span>
            All times are converted to your timezone:{' '}
            <strong style={styles.timezoneStrong}>{getTimezoneDisplay()}</strong>
          </span>
        </span>
        <button style={styles.changeTimezoneButton}>Change timezone</button>
      </div>

      {/* Calendar grid */}
      <div style={styles.gridContainer}>
        <div style={styles.grid}>
          {/* Header row */}
          <div style={styles.headerCorner}>{timezone.split('/').pop()?.slice(0, 4) || 'Time'}</div>
          {DAYS.map((day, idx) => (
            <div
              key={day}
              style={{
                ...styles.dayHeader,
                ...(isToday(idx) ? styles.dayHeaderToday : {}),
              }}
            >
              {day} {getDayDate(idx)}
            </div>
          ))}

          {/* Time slots */}
          {gridRows.map((row, rowIdx) => (
            <div key={rowIdx} style={styles.gridRowWrapper}>
              {/* Hour label */}
              {row.minute === 0 && (
                <div style={styles.hourLabel}>{row.hour.toString().padStart(2, '0')}:00</div>
              )}
              {row.minute !== 0 && <div style={styles.hourLabel}></div>}

              {/* Slots for each day */}
              {row.slots.map((slot, dayIdx) => {
                const count = slot?.count || 0;
                const slotIsBest = count > 0 && count === maxCount;
                const slotKey = `${row.hour}-${row.minute}-${dayIdx}`;

                return (
                  <button
                    key={slotKey}
                    className={`calendar-slot ${getHeatClass(count, maxCount, levels)}`}
                    style={{
                      ...styles.slot,
                      ...(slotIsBest ? { boxShadow: 'inset 0 0 0 2px var(--amber)' } : {}),
                    }}
                    onClick={() => slot && handleSlotInteraction(slot)}
                    onMouseEnter={slot ? (e) => handleSlotMouseEnter(slot, e) : undefined}
                    onMouseLeave={handleSlotMouseLeave}
                    onFocus={slot ? (e) => handleSlotFocus(slot, e) : undefined}
                    onBlur={handleSlotBlur}
                    aria-label={
                      slot
                        ? `${DAYS[dayIdx]} ${getDayDate(dayIdx)}, ${row.hour}:${row.minute.toString().padStart(2, '0')}, ${count} friend${count !== 1 ? 's' : ''} available${slotIsBest ? ', best time' : ''}`
                        : `${DAYS[dayIdx]} ${getDayDate(dayIdx)}, ${row.hour}:${row.minute.toString().padStart(2, '0')}, no friends available`
                    }
                    disabled={!slot || count === 0}
                  >
                    {count > 0 ? (
                      <>
                        <div style={styles.slotCount}>{count}</div>
                      </>
                    ) : (
                      ''
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hover card */}
        {hoverCard && (
          <div
            ref={cardRef}
            style={{
              ...styles.hoverCard,
              position: 'fixed',
              left: 0,
              top: 0,
            }}
            role="tooltip"
          >
            <div style={styles.hoverCardArrow} />
            <div>
              <div style={styles.hoverCardTitle}>
                {DAYS[hoverCard.slot.dayIndex]} {getDayDate(hoverCard.slot.dayIndex)} ·{' '}
                {hoverCard.slot.hourMinute} – {addMinutes(hoverCard.slot.hourMinute, SLOT_MINUTES)}
              </div>
              <div style={styles.hoverCardSubtitle}>Your time ({timezone.split('/').pop()})</div>
            </div>
            <div style={styles.hoverCardCount}>
              {hoverCard.slot.count} friend{hoverCard.slot.count !== 1 ? 's' : ''} free
            </div>
            <div style={styles.friendsList}>
              {hoverCard.friends.map((friend) => (
                <div
                  key={`${friend.name}-${friend.initials || ''}-${friend.localTime}`}
                  style={styles.friendRow}
                >
                  <span style={styles.friendInitials}>{friend.initials}</span>
                  <span style={styles.friendName}>{friend.name}</span>
                  <small style={styles.friendTime}>
                    {friend.localTime}
                    {friend.timezone && ` · ${friend.timezone}`}
                  </small>
                </div>
              ))}
            </div>
            {hoverCard.notFreeFriends.length > 0 && (
              <div style={styles.notFreeSection}>
                Not free: {hoverCard.notFreeFriends.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div style={styles.legend}>
          <span style={styles.legendLabel}>Friends free</span>
          {Array.from({ length: levels }, (_, i) => i + 1).map((level) => (
            <span key={level} className={`c${level}`} style={styles.legendItem}>
              {level}
            </span>
          ))}
          <span style={styles.legendItemBest}>
            <span style={styles.bestOutline} /> Best moment
          </span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  weekNav: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  weekNavLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navButton: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  weekLabel: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: '16px',
    minWidth: '120px',
    textAlign: 'center',
  },
  timezoneBanner: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    fontSize: '14px',
  },
  timezoneBannerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  timezoneStrong: {
    color: 'var(--mint)',
    fontWeight: 600,
  },
  changeTimezoneButton: {
    minHeight: '44px',
    padding: '0 10px',
    border: '0',
    background: 'transparent',
    color: 'var(--muted)',
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  gridContainer: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '16px',
    overflowX: 'auto',
    position: 'relative',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '52px repeat(7, minmax(54px, 1fr))',
    gap: '4px',
    minWidth: '520px',
  },
  headerCorner: {
    fontFamily: 'var(--font-heading)',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--muted)',
    textAlign: 'right',
    paddingRight: '8px',
    alignSelf: 'start',
  },
  dayHeader: {
    fontFamily: 'var(--font-heading)',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--muted)',
    textAlign: 'center',
    padding: '6px 0',
  },
  dayHeaderToday: {
    color: 'var(--amber)',
  },
  gridRowWrapper: {
    display: 'contents',
  },
  hourLabel: {
    fontSize: '12px',
    lineHeight: '12px',
    fontWeight: 500,
    color: 'var(--muted)',
    display: 'block',
    alignSelf: 'start',
    marginTop: '-6px',
    textAlign: 'right',
    paddingRight: '8px',
  },
  slot: {
    fontStyle: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '28px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  slotCount: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1,
  },
  slotFriends: {
    marginTop: '2px',
    fontSize: '9px',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1,
    textTransform: 'uppercase',
  },
  hoverCard: {
    position: 'absolute',
    width: '244px',
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
    zIndex: 10,
    pointerEvents: 'none',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  hoverCardArrow: {
    position: 'absolute',
    left: '-7px',
    top: '30px',
    width: '12px',
    height: '12px',
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRight: 'none',
    borderTop: 'none',
    transform: 'rotate(45deg)',
  },
  hoverCardTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '15px',
    fontWeight: 700,
  },
  hoverCardSubtitle: {
    fontSize: '12px',
    color: 'var(--muted)',
    marginTop: '2px',
  },
  hoverCardCount: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--mint)',
  },
  friendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  friendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: 600,
  },
  friendInitials: {
    flex: '0 0 28px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 600,
  },
  friendName: {
    flex: 1,
  },
  friendTime: {
    marginLeft: 'auto',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-2)',
  },
  notFreeSection: {
    borderTop: '1px solid var(--border)',
    paddingTop: '10px',
    fontSize: '12px',
    color: 'var(--muted)',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    fontSize: '12px',
    color: 'var(--muted)',
  },
  legendLabel: {
    marginRight: '4px',
  },
  legendItem: {
    width: '28px',
    height: '24px',
    borderRadius: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
  },
  legendItemBest: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  bestOutline: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: '2px solid var(--amber)',
    background: 'transparent',
    display: 'inline-block',
  },
};
