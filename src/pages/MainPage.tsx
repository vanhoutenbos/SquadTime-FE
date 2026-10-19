import { useState, useEffect, useMemo } from 'react';
import { useAuth, useDemoFriends } from '../hooks/useAuth';
import { strings } from '../strings';
import { HoverCardData } from '../components/CalendarGrid';
import { FriendsPanel } from '../components/FriendsPanel';
import {
  buildMockFriends,
  buildMockTonight,
  buildMockWeek,
  CalendarSlot,
  CalendarWeek,
  Friend,
  TonightFriend,
} from '../components/MockData';
import { Header } from '../components/Header';
import { AccountMenu } from '../components/AccountMenu';
import { MainPageCalendar } from '../components/MainPageCalendar';
import { styles } from '../components/MainPageStyles';
// import { SharingOffState } from '../components/SharingOffState';
import { generateAndCopyInvite, generateAndCopyInviteForFriend } from '../utils/invite';
import { showToast } from '../utils/toast';
import {
  computeAvailability,
  UserAvailability,
  Rule,
  Exception,
  utcToLocal,
  SLOT_MINUTES,
} from '../engine/timeEngine';

export function MainPage() {
  const { user, demoMode } = useAuth();
  const demoFriends = useDemoFriends();

  const [weekOffset, setWeekOffset] = useState(0);
  const [hoverCard, setHoverCard] = useState<HoverCardData | null>(null);
  const [friendsVisibility, setFriendsVisibility] = useState<Record<string, boolean>>({});
  const [realFriends, setRealFriends] = useState<Friend[]>([]);
  const [realRules, setRealRules] = useState<Rule[]>([]);
  const [realExceptions, setRealExceptions] = useState<Exception[]>([]);
  const [friendUserData, setFriendUserData] = useState<
    Map<string, { rules: Rule[]; exceptions: Exception[] }>
  >(new Map());

  // Load real friends when logged in with Discord
  useEffect(() => {
    if (demoMode || !user) return;
    let cancelled = false;
    fetch('/api/friends', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { friends: [] }))
      .then((data) => {
        const list = (data.friends || []).map(
          (f: {
            discord_id: string;
            display_name: string;
            timezone: string;
            sharing: boolean;
            show_in_calendar?: boolean;
          }) => ({
            id: f.discord_id,
            displayName: f.display_name,
            initials: f.display_name.slice(0, 2).toUpperCase(),
            timezone: f.timezone,
            isSharing: f.sharing === true,
            isOnSquadTime: true,
            showInCalendar:
              friendsVisibility[f.discord_id] !== undefined
                ? friendsVisibility[f.discord_id]
                : f.show_in_calendar !== false,
          })
        ) as Friend[];
        if (!cancelled) setRealFriends(list);
      })
      .catch(() => {
        if (!cancelled) setRealFriends([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, demoMode]);

  useEffect(() => {
    if (demoMode || !user) return;
    Promise.all([
      fetch('/api/rules', { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : { rules: [] }
      ),
      fetch('/api/exceptions', { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : { exceptions: [] }
      ),
    ])
      .then(([rulesData, excData]) => {
        const rules = (rulesData.rules || []).map(
          (r: {
            id: number;
            user_id: string;
            weekdays: string | number[];
            start_time: string;
            end_time: string;
            tz: string;
            valid_from: number;
            valid_to: number | null;
          }) => ({
            id: r.id,
            user_id: r.user_id,
            weekdays:
              typeof r.weekdays === 'string' ? r.weekdays.split(',').map(Number) : r.weekdays,
            start_time: r.start_time,
            end_time: r.end_time,
            tz: r.tz,
            valid_from: r.valid_from,
            valid_to: r.valid_to,
          })
        ) as Rule[];
        const exceptions = (excData.exceptions || []).map(
          (e: {
            id: number;
            user_id: string;
            rule_id: number | null;
            local_date: string;
            type: 'cancelled' | 'changed' | 'extra';
            start_time: string | null;
            end_time: string | null;
          }) => ({
            id: e.id,
            user_id: e.user_id,
            rule_id: e.rule_id,
            local_date: e.local_date,
            type: e.type,
            start_time: e.start_time,
            end_time: e.end_time,
          })
        ) as Exception[];
        setRealRules(rules);
        setRealExceptions(exceptions);
      })
      .catch(() => {
        setRealRules([]);
        setRealExceptions([]);
      });
  }, [user, demoMode]);

  // Load each sharing friend's rules/exceptions so they appear on the calendar
  useEffect(() => {
    if (demoMode || !user) return;
    let cancelled = false;
    const sharingFriends = realFriends.filter((f) => f.isSharing && f.showInCalendar !== false);
    const mapRule = (r: {
      id: number;
      user_id: string;
      weekdays: string | number[];
      start_time: string;
      end_time: string;
      tz: string;
      valid_from: number;
      valid_to: number | null;
    }): Rule => ({
      id: r.id,
      user_id: r.user_id,
      weekdays: typeof r.weekdays === 'string' ? r.weekdays.split(',').map(Number) : r.weekdays,
      start_time: r.start_time,
      end_time: r.end_time,
      tz: r.tz,
      valid_from: r.valid_from,
      valid_to: r.valid_to,
    });
    const mapExc = (e: {
      id: number;
      user_id: string;
      rule_id: number | null;
      local_date: string;
      type: 'cancelled' | 'changed' | 'extra';
      start_time: string | null;
      end_time: string | null;
    }): Exception => ({
      id: e.id,
      user_id: e.user_id,
      rule_id: e.rule_id,
      local_date: e.local_date,
      type: e.type,
      start_time: e.start_time,
      end_time: e.end_time,
    });
    Promise.allSettled(
      sharingFriends.map(async (f) => {
        const [rulesData, excData] = await Promise.all([
          fetch(`/api/rules?user_id=${encodeURIComponent(f.id)}`, { credentials: 'include' }).then(
            (r) => (r.ok ? r.json() : { rules: [] })
          ),
          fetch(`/api/exceptions?user_id=${encodeURIComponent(f.id)}`, {
            credentials: 'include',
          }).then((r) => (r.ok ? r.json() : { exceptions: [] })),
        ]);
        return {
          id: f.id,
          rules: (rulesData.rules || []).map(mapRule),
          exceptions: (excData.exceptions || []).map(mapExc),
        };
      })
    )
      .then((results) => {
        if (cancelled) return;
        const next = new Map<string, { rules: Rule[]; exceptions: Exception[] }>();
        for (const r of results) {
          if (r.status === 'fulfilled') next.set(r.value.id, r.value);
        }
        setFriendUserData(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, demoMode, realFriends]);

  const hasFriends = (demoMode && demoFriends.length > 0) || realFriends.length > 0;
  // const isSharing = user?.sharing !== false;

  const handleSlotClick = (_slot: CalendarSlot) => {
    // slot click handled by parent
  };

  const friends = demoMode
    ? buildMockFriends(demoFriends, friendsVisibility)
    : realFriends.map((f) => ({
        ...f,
        showInCalendar:
          friendsVisibility[f.id] !== undefined ? friendsVisibility[f.id] : f.showInCalendar,
      }));

  const getHoverCard = (slot: CalendarSlot): HoverCardData | null => {
    if (demoMode) {
      const mockFriends = [
        { name: 'Priya', initials: 'PR', localTime: '19:00', timezone: 'London' },
        { name: 'Mara', initials: 'MA', localTime: '20:00' },
      ].slice(0, slot.count);
      const notFree = ['Joeri', 'Sanne', 'Tom'].slice(0, Math.max(0, 5 - slot.count));
      return { slot, friends: mockFriends, notFreeFriends: notFree };
    }
    if (!weekAvailResult || !user) return null;
    const slotEnd = slot.timestamp + SLOT_MINUTES * 60 * 1000;
    const free: { name: string; initials: string; localTime: string; timezone?: string }[] = [];
    const notFree: string[] = [];
    const allUsers = [
      { id: user.discord_id, name: user.display_name, tz: user.timezone || 'Europe/Amsterdam' },
      ...realFriends
        .filter((f) => f.isSharing && f.showInCalendar !== false)
        .map((f) => ({ id: f.id, name: f.displayName, tz: f.timezone })),
    ];
    for (const u of allUsers) {
      const windows = weekAvailResult.userWindows.get(u.id) || [];
      const overlapping = windows.some((w) => w.start < slotEnd && w.end > slot.timestamp);
      if (overlapping) {
        const local = utcToLocal(slot.timestamp, u.tz);
        free.push({
          name: u.name,
          initials: u.name.slice(0, 2).toUpperCase(),
          localTime: local.time,
          timezone: u.tz.split('/').pop(),
        });
      } else {
        notFree.push(u.name);
      }
    }
    return { slot, friends: free, notFreeFriends: notFree };
  };

  const handleSlotHover = (slot: CalendarSlot | null) => {
    setHoverCard(slot ? getHoverCard(slot) : null);
  };

  const handleToggleFriend = async (friendId: string, show: boolean) => {
    setFriendsVisibility((prev) => ({ ...prev, [friendId]: show }));
    setRealFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, showInCalendar: show } : f))
    );
    if (demoMode) return;
    try {
      await fetch(`/api/friends/${friendId}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ show_in_calendar: show }),
      });
    } catch {
      setFriendsVisibility((prev) => ({ ...prev, [friendId]: !show }));
    }
  };

  const handleInviteFriend = async (friendId: string) => {
    const friend = friends.find((f: Friend) => f.id === friendId);
    if (!friend) return;

    const success = await generateAndCopyInviteForFriend(friend.displayName);
    if (success) {
      showToast({ message: strings.invite.copied, type: 'success' });
    } else {
      showToast({ message: 'Failed to copy invite', type: 'error' });
    }
  };

  const handleInviteNew = async () => {
    const success = await generateAndCopyInvite();
    if (success) {
      showToast({ message: strings.invite.copied, type: 'success' });
    } else {
      showToast({ message: 'Failed to copy invite', type: 'error' });
    }
  };

  const computeWeekRange = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset + offset * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return { weekStart, weekEnd };
  };

  const weekAvailResult = useMemo(() => {
    if (demoMode) return null;
    const { weekStart, weekEnd } = computeWeekRange(weekOffset);
    const tz = user?.timezone || 'Europe/Amsterdam';
    const users: UserAvailability[] = [
      { user_id: user?.discord_id || 'me', rules: realRules, exceptions: realExceptions },
    ];
    for (const f of realFriends) {
      if (f.isSharing && f.showInCalendar !== false) {
        const fd = friendUserData.get(f.id);
        users.push({ user_id: f.id, rules: fd?.rules ?? [], exceptions: fd?.exceptions ?? [] });
      }
    }
    return computeAvailability(users, tz, weekStart.getTime(), weekEnd.getTime());
  }, [demoMode, weekOffset, user, realRules, realExceptions, realFriends, friendUserData]);

  const weekData: CalendarWeek = useMemo(() => {
    if (demoMode) return buildMockWeek(weekOffset);
    const { weekStart, weekEnd } = computeWeekRange(weekOffset);
    const tz = user?.timezone || 'Europe/Amsterdam';
    const avail =
      weekAvailResult ||
      computeAvailability(
        [{ user_id: user?.discord_id || 'me', rules: realRules, exceptions: realExceptions }],
        tz,
        weekStart.getTime(),
        weekEnd.getTime()
      );
    const slots: CalendarSlot[] = [];
    const slotFreeFriends = new Map<number, string[]>();
    for (const [ts, count] of avail.slotCounts.entries()) {
      const slotEnd = ts + SLOT_MINUTES * 60 * 1000;
      const dayIndex = Math.floor((ts - weekStart.getTime()) / (24 * 60 * 60 * 1000));
      const local = utcToLocal(ts, tz);
      const free: string[] = [];
      for (const f of realFriends) {
        if (!f.isSharing || f.showInCalendar === false) continue;
        const windows = avail.userWindows.get(f.id) || [];
        if (windows.some((w) => w.start < slotEnd && w.end > ts)) {
          free.push(f.displayName);
        }
      }
      slotFreeFriends.set(ts, free);
      slots.push({ timestamp: ts, count, dayIndex, hourMinute: local.time, freeFriends: free });
    }
    return { weekStart, weekEnd, slots, slotFreeFriends };
  }, [demoMode, weekOffset, user, realRules, realExceptions, realFriends, weekAvailResult]);

  const { friends: tonightFriendsComputed, bestTimeSlot } = useMemo(() => {
    if (demoMode) return buildMockTonight();
    if (!user) return { friends: [] as TonightFriend[], bestTimeSlot: null };
    const tz = user.timezone || 'Europe/Amsterdam';
    const avail = computeAvailability(
      [{ user_id: user.discord_id, rules: realRules, exceptions: realExceptions }],
      tz,
      Date.now(),
      Date.now() + 3 * 60 * 60 * 1000
    );
    const tonight = avail.tonight;
    const friendsList: TonightFriend[] = tonight.map((w) => {
      const local = utcToLocal(w.start, tz);
      return {
        name: user.display_name,
        initials: user.display_name.slice(0, 2).toUpperCase(),
        localTime: local.time,
        isAvailableNow: w.start <= Date.now(),
      };
    });
    const best =
      tonight.length > 0
        ? {
            day: new Date(tonight[0].start).toLocaleDateString('en-US', { weekday: 'short' }),
            timeRange: `${utcToLocal(tonight[0].start, tz).time} – ${utcToLocal(tonight[0].end, tz).time}`,
            count: tonight.length,
            totalSharing: tonight.length,
          }
        : null;
    return { friends: friendsList, bestTimeSlot: best };
  }, [demoMode, user, realRules, realExceptions]);

  const weekDataResolved = weekData;
  const tonightFriends = demoMode ? buildMockTonight().friends : tonightFriendsComputed;
  const tonightBest = demoMode ? buildMockTonight().bestTimeSlot : bestTimeSlot;

  return (
    <div style={styles.page}>
      <Header right={<AccountMenu />} />

      <main style={styles.main}>
        <div style={styles.layout}>
          {/* Friends panel - left side on desktop */}
          {hasFriends && (
            <FriendsPanel
              friends={friends}
              onToggleShowInCalendar={handleToggleFriend}
              onInviteFriend={handleInviteFriend}
              onInviteNew={handleInviteNew}
            />
          )}

          {/* Main content area */}
          <section style={styles.mainContent}>
            {/* Hero section with title and description */}
            <div style={styles.hero}>
              <div>
                <h2 style={styles.heroTitle}>
                  {strings.home.title.split('game').map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && <span style={{ color: 'var(--mint)' }}>game</span>}
                    </span>
                  ))}
                </h2>
                <p style={styles.heroDescription}>
                  Sharing goes both ways: if you stop sharing your times, you won't see your
                  friends' times either. Manage this in Settings.
                </p>
              </div>
              <a href="/add-times" style={styles.addTimesButton}>
                {strings.home.primaryAction}
              </a>
            </div>

            {hasFriends ? (
              <MainPageCalendar
                weekData={weekDataResolved}
                timezone={user?.timezone || 'Europe/Amsterdam'}
                tonightFriends={tonightFriends}
                tonightBest={tonightBest}
                hoverCard={hoverCard}
                onPrevWeek={() => {
                  if (weekOffset > 0) setWeekOffset(weekOffset - 1);
                }}
                onNextWeek={() => setWeekOffset(weekOffset + 1)}
                isCurrentWeek={weekOffset === 0}
                onSlotClick={handleSlotClick}
                onSlotHover={handleSlotHover}
                handleSlotClick={handleSlotClick}
                handleSlotHover={handleSlotHover}
              />
            ) : (
              <>
                {/* Empty state when no friends */}
                <div style={styles.noFriendsCard}>
                  <h3 style={styles.noFriendsTitle}>Gaming is more fun with a squad</h3>
                  <p style={styles.noFriendsDescription}>
                    Invite your friends to see when everyone can play together across timezones.
                  </p>
                  <button onClick={handleInviteNew} style={styles.inviteButton}>
                    Invite friends
                  </button>
                  <a
                    href="https://discord.gg/XmzRNm9N6Y"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.communityLink}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.445.764-.693 1.163a19.277 19.277 0 0 0-5.425 0 12.62 12.62 0 0 0-.695-1.163.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.68 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.994 6.267.077.077 0 0 0 .084-.028c.464-.613.977-1.217 1.483-1.847a.077.077 0 0 1 .085-.001 13.294 13.294 0 0 0 1.635 1.543.074.074 0 0 0 .084.028c2.651-1.636 5.128-3.595 6.967-5.071a.077.077 0 0 0 .083-.028.07.07 0 0 0 .031-.057c.423-4.627-.472-9.226-3.548-13.66a.061.061 0 0 0-.032-.027zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418z" />
                    </svg>
                    Join our Discord community
                  </a>
                </div>

                {/* Still show coming soon even without friends */}
                <div style={styles.comingSoonSection}>
                  <span style={styles.comingSoonLabel}>Coming soon</span>
                  <div style={styles.comingSoonPills}>
                    <span style={styles.comingSoonPill}>Pick a game</span>
                    <span style={styles.comingSoonPill}>Reminders</span>
                    <span style={styles.comingSoonPill}>Calendar feed</span>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        {demoMode && (
          <section style={styles.debugSection}>
            <h3>Debug Info</h3>
            <p style={styles.debugNote}>
              Toggle demo mode off to see the empty state. Current user: {user?.display_name}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
