import { WEEKDAYS } from './TimeHelpers';

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

export interface RuleFormProps {
  selectedWeekdays: number[];
  onToggleWeekday: (day: number) => void;
  ruleStart: string;
  onChangeStart: (val: string) => void;
  ruleEnd: string;
  onChangeEnd: (val: string) => void;
  timezone: string;
  onSave: () => void;
  onClear: () => void;
  loading: boolean;
  saveError: string;
}

export default function RuleForm({
  selectedWeekdays,
  onToggleWeekday,
  ruleStart,
  onChangeStart,
  ruleEnd,
  onChangeEnd,
  timezone,
  onSave,
  onClear,
  loading,
  saveError,
}: RuleFormProps) {
  const isWeekdaySelected = (day: number) => selectedWeekdays.includes(day);

  return (
    <section
      style={{
        background: 'var(--bg-bar)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <h2 style={{ margin: 0, font: '700 18px var(--font-heading)' }}>Usual times</h2>
        <p style={{ margin: '4px 0 0', font: '400 14px var(--font-body)', color: '#9AA1AF' }}>
          Repeats every week until you change it.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group" aria-label="Days">
        {WEEKDAYS.map((wd) => (
          <button
            key={wd.key}
            type="button"
            onClick={() => onToggleWeekday(wd.key)}
            aria-pressed={isWeekdaySelected(wd.key)}
            style={{
              minWidth: 52,
              minHeight: 44,
              padding: '0 10',
              borderRadius: 10,
              border: '1px solid var(--border-strong)',
              background: isWeekdaySelected(wd.key) ? '#2EE6A6' : 'transparent',
              color: isWeekdaySelected(wd.key) ? '#04120C' : '#C4C9D4',
              font: '600 14px var(--font-body)',
              cursor: 'pointer',
            }}
          >
            {wd.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
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
            value={ruleStart}
            onChange={(e) => onChangeStart(e.target.value)}
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
            value={ruleEnd}
            onChange={(e) => onChangeEnd(e.target.value)}
            style={timeInputStyle}
          />
        </label>
      </div>
      <p style={{ margin: 0, font: '400 14px var(--font-body)', color: '#9AA1AF' }}>
        Times are in your timezone: {timezone}.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          style={{
            minHeight: 44,
            padding: '0 14px',
            borderRadius: 10,
            border: '1px solid #FFB547',
            background: '#FFB547',
            color: '#1A1203',
            font: '700 14px var(--font-body)',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Save usual times'}
        </button>
        <button
          type="button"
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
          Add another time range
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          style={{
            minHeight: 44,
            padding: '0 14px',
            borderRadius: 10,
            border: '1px solid var(--border-strong)',
            background: 'transparent',
            color: '#FF5C5C',
            font: '500 14px var(--font-body)',
            cursor: 'pointer',
          }}
        >
          Clear all usual times
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
  );
}
