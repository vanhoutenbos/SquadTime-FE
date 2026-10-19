import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { AccountMenu } from '../components/AccountMenu';
import RuleForm from '../components/RuleForm';
import UpcomingList from '../components/UpcomingList';
import { Rule, Exception } from '../engine/timeEngine';
import { UpcomingItem, formatDayMonth, buildUpcomingItems } from '../components/TimeHelpers';

const timeInputStyle: React.CSSProperties = {
  minHeight: 44,
  padding: '0 12px',
  borderRadius: 10,
  border: '1px solid var(--border-strong)',
  background: 'var(--surface)',
  color: 'var(--text)',
  font: '500 15px var(--font-body)',
  colorScheme: 'dark',
  boxSizing: 'border-box',
  width: '100%',
};

export default function AddTimesPage() {
  const navigate = useNavigate();
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3, 5]);
  const [ruleStart, setRuleStart] = useState('20:00');
  const [ruleEnd, setRuleEnd] = useState('23:00');
  const [oneTimeDate, setOneTimeDate] = useState('');
  const [oneTimeStart, setOneTimeStart] = useState('20:00');
  const [oneTimeEnd, setOneTimeEnd] = useState('22:30');
  const [editingItem, setEditingItem] = useState<UpcomingItem | null>(null);
  const [applyTo, setApplyTo] = useState<'only' | 'future'>('only');
  const [stillTrueConfirmed, setStillTrueConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);

  const computeWeekRange = (now: Date): { weekStart: number; weekEnd: number } => {
    const d = new Date(now);
    const day = d.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return { weekStart: weekStart.getTime(), weekEnd: weekEnd.getTime() };
  };

  useEffect(() => {
    let cancelled = false;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    const today = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    today.setHours(0, 0, 0, 0);
    const { weekStart, weekEnd } = computeWeekRange(today);
    const rangeEnd = new Date(today).setDate(today.getDate() + 14);

    Promise.all([
      fetch('/api/rules', { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : { rules: [] }
      ),
      fetch('/api/exceptions', { credentials: 'include' }).then((r) =>
        r.ok ? r.json() : { exceptions: [] }
      ),
    ])
      .then(([rulesData, excData]) => {
        const rules: Rule[] = (rulesData.rules || []).map(
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
        );
        const exceptions: Exception[] = (excData.exceptions || []).map(
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
        );
        const items = buildUpcomingItems(rules, exceptions, tz, weekStart, weekEnd, rangeEnd);
        if (!cancelled) setUpcomingItems(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleWeekday = useCallback((day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const handleSaveRule = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSaveError('');
    try {
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          weekdays: selectedWeekdays.join(','),
          start_time: ruleStart,
          end_time: ruleEnd,
          tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
          valid_from: 0,
          valid_to: null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error || 'Failed to save rule');
        return;
      }
      setSelectedWeekdays([1, 3, 5]);
      setRuleStart('20:00');
      setRuleEnd('23:00');
      await refreshUpcoming();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOneTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneTimeDate) {
      alert('Please pick a date');
      return;
    }
    setLoading(true);
    setSaveError('');
    try {
      const response = await fetch('/api/exceptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rule_id: null,
          local_date: oneTimeDate,
          type: 'extra',
          start_time: oneTimeStart,
          end_time: oneTimeEnd,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error || 'Failed to add slot');
        return;
      }
      setOneTimeDate('');
      setOneTimeStart('20:00');
      setOneTimeEnd('22:30');
      await refreshUpcoming();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to add slot');
    } finally {
      setLoading(false);
    }
  };

  const refreshUpcoming = async () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { weekStart, weekEnd } = computeWeekRange(today);
    const rangeEnd = new Date(today).getTime() + 14 * 24 * 60 * 60 * 1000;
    const [rulesData, excData] = await Promise.all([
      fetch('/api/rules', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/exceptions', { credentials: 'include' }).then((r) => r.json()),
    ]);
    const rules: Rule[] = (rulesData.rules || []).map(
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
        weekdays: typeof r.weekdays === 'string' ? r.weekdays.split(',').map(Number) : r.weekdays,
        start_time: r.start_time,
        end_time: r.end_time,
        tz: r.tz,
        valid_from: r.valid_from,
        valid_to: r.valid_to,
      })
    );
    const exceptions: Exception[] = (excData.exceptions || []).map(
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
    );
    setUpcomingItems(buildUpcomingItems(rules, exceptions, tz, weekStart, weekEnd, rangeEnd));
  };

  const handleCancelItem = async (item: UpcomingItem) => {
    if (!window.confirm(`Cancel ${item.day} ${formatDayMonth(item.date)}?`)) return;
    setLoading(true);
    setSaveError('');
    try {
      const exceptionId = item.exceptionId;
      const url = exceptionId ? `/api/exceptions/${exceptionId}` : `/api/exceptions`;
      const method = exceptionId ? 'DELETE' : 'POST';
      const body = exceptionId
        ? undefined
        : JSON.stringify({
            rule_id: item.ruleId ?? null,
            local_date: item.date,
            type: 'cancelled',
            start_time: null,
            end_time: null,
          });
      const response = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        credentials: 'include',
        body,
      });
      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error || 'Failed to cancel');
        return;
      }
      setEditingItem(null);
      await refreshUpcoming();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChange = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingItem) return;
    setLoading(true);
    setSaveError('');
    try {
      const exceptionId = editingItem.exceptionId;
      const url = exceptionId ? `/api/exceptions/${exceptionId}` : `/api/exceptions`;
      const method = exceptionId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rule_id: editingItem.ruleId ?? null,
          local_date: editingItem.date,
          type: editingItem.status === 'cancelled' ? 'cancelled' : 'changed',
          start_time: ruleStart,
          end_time: ruleEnd,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error || 'Failed to save change');
        return;
      }
      setEditingItem(null);
      setApplyTo('only');
      await refreshUpcoming();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllRules = async () => {
    if (!window.confirm('Delete all your usual times? This cannot be undone.')) return;
    setLoading(true);
    setSaveError('');
    try {
      const response = await fetch('/api/rules', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        setSaveError(data.error || 'Failed to clear usual times');
        return;
      }
      setSelectedWeekdays([1, 3, 5]);
      setRuleStart('20:00');
      setRuleEnd('23:00');
      await refreshUpcoming();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to clear usual times');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToUsual = () => {
    setEditingItem(null);
    setApplyTo('only');
  };

  const handleEditItem = (item: UpcomingItem) => {
    setEditingItem(item);
    setSaveError('');
  };

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header right={<AccountMenu />} />

      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          padding: '24px 32px',
          width: '100%',
          maxWidth: 1360,
          margin: '0 auto',
          boxSizing: 'border-box',
          flex: 1,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={() => navigate('/main')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minHeight: 44,
              padding: '0 14px',
              borderRadius: 10,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface)',
              color: 'var(--text)',
              font: '500 14px var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <svg
              width="16"
              height="16"
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
            Calendar
          </button>
          <div>
            <h1 style={{ margin: 0, font: '700 28px var(--font-heading)' }}>
              Add my <span style={{ color: '#2EE6A6' }}>times</span>
            </h1>
            <p style={{ margin: '4px 0 0', font: '400 14px var(--font-body)', color: '#9AA1AF' }}>
              Set your usual evenings once. Change a single day any time, without touching the rest.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24 }}>
          <div
            style={{
              flex: '1 1 360px',
              maxWidth: 460,
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            <RuleForm
              selectedWeekdays={selectedWeekdays}
              onToggleWeekday={toggleWeekday}
              ruleStart={ruleStart}
              onChangeStart={setRuleStart}
              ruleEnd={ruleEnd}
              onChangeEnd={setRuleEnd}
              timezone={timezone}
              onSave={handleSaveRule}
              onClear={handleClearAllRules}
              loading={loading}
              saveError={saveError}
            />

            <section
              style={{
                background: 'var(--bg-bar)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div>
                <h2 style={{ margin: 0, font: '700 18px var(--font-heading)' }}>
                  Extra one-time slot
                </h2>
                <p
                  style={{ margin: '4px 0 0', font: '400 14px var(--font-body)', color: '#9AA1AF' }}
                >
                  For the odd evening that isn't in your usual times.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    font: '500 13px var(--font-body)',
                    color: '#9AA1AF',
                    flex: 1,
                  }}
                >
                  Date
                  <input
                    type="date"
                    value={oneTimeDate}
                    onChange={(e) => setOneTimeDate(e.target.value)}
                    style={timeInputStyle}
                  />
                </label>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    font: '500 13px var(--font-body)',
                    color: '#9AA1AF',
                  }}
                >
                  From
                  <input
                    type="time"
                    value={oneTimeStart}
                    onChange={(e) => setOneTimeStart(e.target.value)}
                    style={timeInputStyle}
                  />
                </label>
                <label
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    font: '500 13px var(--font-body)',
                    color: '#9AA1AF',
                  }}
                >
                  To
                  <input
                    type="time"
                    value={oneTimeEnd}
                    onChange={(e) => setOneTimeEnd(e.target.value)}
                    style={timeInputStyle}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleAddOneTime}
                  disabled={loading}
                  style={{
                    minHeight: 44,
                    padding: '0 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border-strong)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    font: '500 14px var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  {loading ? 'Saving...' : 'Add one-time slot'}
                </button>
              </div>
              {saveError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#3A1A1A',
                    border: '1px solid #FF5C5C',
                    color: '#FFB3B3',
                    font: '500 14px var(--font-body)',
                  }}
                >
                  {saveError}
                </div>
              )}
            </section>
          </div>

          <UpcomingList
            upcomingItems={upcomingItems}
            editingItem={editingItem}
            onEditItem={handleEditItem}
            onCloseEdit={() => setEditingItem(null)}
            stillTrueConfirmed={stillTrueConfirmed}
            onConfirmStillTrue={() => setStillTrueConfirmed(true)}
            applyTo={applyTo}
            onChangeApplyTo={setApplyTo}
            ruleStart={ruleStart}
            onChangeRuleStart={setRuleStart}
            ruleEnd={ruleEnd}
            onChangeRuleEnd={setRuleEnd}
            onSaveChange={handleSaveChange}
            onResetToUsual={handleResetToUsual}
            onCancelItem={handleCancelItem}
            loading={loading}
            saveError={saveError}
          />
        </div>
      </main>
    </div>
  );
}
