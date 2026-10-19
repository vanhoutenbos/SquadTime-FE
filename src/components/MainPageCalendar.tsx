import { CalendarGrid, CalendarSlot, CalendarWeek, HoverCardData } from './CalendarGrid';
import { TonightCard, TonightFriend } from './TonightCard';
import { styles } from './MainPageStyles';

export interface MainPageCalendarProps {
  weekData: CalendarWeek;
  timezone: string;
  tonightFriends: TonightFriend[];
  tonightBest: { day: string; timeRange: string; count: number; totalSharing: number } | null;
  hoverCard: HoverCardData | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  isCurrentWeek?: boolean;
  onSlotClick?: (slot: CalendarSlot) => void;
  onSlotHover?: (slot: CalendarSlot | null) => void;
  handleSlotClick?: (slot: CalendarSlot) => void;
  handleSlotHover?: (slot: CalendarSlot | null) => void;
}

export function MainPageCalendar({
  weekData,
  timezone,
  tonightFriends,
  tonightBest,
  hoverCard,
  onPrevWeek,
  onNextWeek,
  isCurrentWeek,
  onSlotClick,
  onSlotHover,
  handleSlotClick,
  handleSlotHover,
}: MainPageCalendarProps) {
  return (
    <>
      {(tonightFriends.length > 0 || tonightBest) && (
        <TonightCard
          friends={tonightFriends}
          bestTimeSlot={tonightBest}
          onSeeThisEvening={() => {
            /* no-op */
          }}
        />
      )}

      <CalendarGrid
        weekData={weekData}
        timezone={timezone}
        onPrevWeek={onPrevWeek}
        onNextWeek={onNextWeek}
        isCurrentWeek={isCurrentWeek}
        onSlotClick={handleSlotClick ?? onSlotClick}
        onSlotHover={handleSlotHover ?? onSlotHover}
        hoverCard={hoverCard}
      />

      <div style={styles.comingSoonSection}>
        <span style={styles.comingSoonLabel}>Coming soon</span>
        <div style={styles.comingSoonPills}>
          <span style={styles.comingSoonPill}>Pick a game</span>
          <span style={styles.comingSoonPill}>Reminders</span>
          <span style={styles.comingSoonPill}>Calendar feed</span>
        </div>
      </div>
    </>
  );
}
