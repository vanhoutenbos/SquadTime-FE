import { UpcomingItem, STATUS_CONFIG, formatDayMonth } from './TimeHelpers';

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

const dayColStyle: React.CSSProperties = {
  width: 56,
  textAlign: 'center',
  font: '700 15px var(--font-heading)',
};

const dayColSpanStyle: React.CSSProperties = {
  display: 'block',
  font: '400 12px var(--font-body)',
  color: '#9AA1AF',
};

const pillStyle = (borderColor: string, textColor: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: '999px',
  font: '600 12px var(--font-body)',
  border: `1px solid ${borderColor}`,
  color: textColor,
});

export interface UpcomingListProps {
  upcomingItems: UpcomingItem[];
  editingItem: UpcomingItem | null;
  onEditItem: (item: UpcomingItem) => void;
  onCloseEdit: () => void;
  stillTrueConfirmed: boolean;
  onConfirmStillTrue: () => void;
  applyTo: 'only' | 'future';
  onChangeApplyTo: (val: 'only' | 'future') => void;
  ruleStart: string;
  onChangeRuleStart: (val: string) => void;
  ruleEnd: string;
  onChangeRuleEnd: (val: string) => void;
  onSaveChange: () => void;
  onResetToUsual: () => void;
  onCancelItem: (item: UpcomingItem) => void;
  loading: boolean;
  saveError: string;
}

export default function UpcomingList({
  upcomingItems,
  editingItem,
  onEditItem,
  onCloseEdit,
  stillTrueConfirmed,
  onConfirmStillTrue,
  applyTo,
  onChangeApplyTo,
  ruleStart,
  onChangeRuleStart,
  ruleEnd,
  onChangeRuleEnd,
  onSaveChange,
  onResetToUsual,
  onCancelItem,
  loading,
  saveError,
}: UpcomingListProps) {
  return (
    <section
      style={{
        flex: '1.5 1 460px',
        minWidth: 0,
        background: 'var(--bg-bar)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <h2 style={{ margin: 0, font: '700 18px var(--font-heading)' }}>Your upcoming times</h2>
          <p style={{ margin: '4px 0 0', font: '400 14px var(--font-body)', color: '#9AA1AF' }}>
            Your usual times for this week, plus every one-time slot you've added.
          </p>
        </div>
        <span style={{ font: '500 13px var(--font-body)', color: '#2EE6A6' }}>
          Friends can see these
        </span>
      </div>

      {stillTrueConfirmed ? (
        <p
          style={{
            font: '400 13px var(--font-body)',
            color: '#9AA1AF',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Thanks for confirming — your times are still accurate this week.
        </p>
      ) : (
        <button
          type="button"
          onClick={onConfirmStillTrue}
          style={{
            minHeight: 44,
            padding: '0 14px',
            borderRadius: 10,
            border: '1px solid var(--border-strong)',
            background: 'var(--surface)',
            color: 'var(--text)',
            font: '500 14px var(--font-body)',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          Still true this week?
        </button>
      )}

      {upcomingItems.length === 0 ? (
        <p
          style={{
            font: '400 13px var(--font-body)',
            color: '#9AA1AF',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          No upcoming times yet. Add a usual time or one-time slot above.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcomingItems.map((item) => {
            const status = STATUS_CONFIG[item.status];
            const isEditing = editingItem?.date === item.date;
            if (isEditing) {
              return (
                <div
                  key={item.date}
                  style={{
                    border: '1px solid #FFB547',
                    borderRadius: 12,
                    background: 'var(--surface)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: 'transparent',
                    }}
                  >
                    <div style={{ ...dayColStyle, ...dayColSpanStyle }}>
                      {item.day}
                      <span style={dayColSpanStyle}>{formatDayMonth(item.date)}</span>
                    </div>
                    <div style={{ flex: '1 1 160px' }}>
                      <div style={{ font: '600 15px var(--font-body)', marginBottom: 4 }}>
                        {item.start_time} – {item.end_time}
                      </div>
                      <span style={pillStyle('#FFB547', '#FFB547')}>
                        {item.status === 'extra'
                          ? 'One-time slot'
                          : `Changed · ${item.start_time} – ${item.end_time}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onCloseEdit}
                      style={{
                        minHeight: 44,
                        padding: '0 16px',
                        border: 0,
                        background: 'transparent',
                        color: '#9AA1AF',
                        font: '500 14px var(--font-body)',
                        cursor: 'pointer',
                      }}
                    >
                      Close
                    </button>
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 4,
                        border: '1px solid var(--border-strong)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        alignSelf: 'flex-start',
                        flexWrap: 'wrap',
                      }}
                      role="group"
                      aria-label="Apply change to"
                    >
                      <button
                        type="button"
                        onClick={() => onChangeApplyTo('only')}
                        aria-pressed={applyTo === 'only'}
                        style={{
                          minHeight: 44,
                          padding: '0 16px',
                          border: 0,
                          background: applyTo === 'only' ? 'var(--border)' : 'var(--surface)',
                          color: applyTo === 'only' ? 'var(--text)' : '#9AA1AF',
                          font:
                            applyTo === 'only'
                              ? '600 14px var(--font-body)'
                              : '500 14px var(--font-body)',
                          cursor: 'pointer',
                        }}
                      >
                        Only this time
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeApplyTo('future')}
                        aria-pressed={applyTo === 'future'}
                        style={{
                          minHeight: 44,
                          padding: '0 16px',
                          border: 0,
                          background: 'var(--surface)',
                          color: applyTo === 'future' ? 'var(--text)' : '#9AA1AF',
                          font: '500 14px var(--font-body)',
                          cursor: 'pointer',
                        }}
                      >
                        This and all future times
                      </button>
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
                          onChange={(e) => onChangeRuleStart(e.target.value)}
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
                          onChange={(e) => onChangeRuleEnd(e.target.value)}
                          style={timeInputStyle}
                        />
                      </label>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <button
                        type="button"
                        onClick={onSaveChange}
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
                        {loading ? 'Saving...' : 'Save change'}
                      </button>
                      <button
                        type="button"
                        onClick={onResetToUsual}
                        style={{
                          minHeight: 44,
                          padding: '0 14px',
                          borderRadius: 10,
                          border: '1px solid var(--border-strong)',
                          background: 'transparent',
                          color: '#9AA1AF',
                          font: '500 14px var(--font-body)',
                          cursor: 'pointer',
                        }}
                      >
                        Reset to usual
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelItem(item)}
                        style={{
                          minHeight: 44,
                          padding: '0 14px',
                          borderRadius: 10,
                          border: '1px solid var(--border-strong)',
                          background: 'transparent',
                          color: '#9AA1AF',
                          font: '500 14px var(--font-body)',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel this time
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
                  </div>
                </div>
              );
            }
            return (
              <div
                key={item.date}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 12,
                  background: 'var(--surface)',
                  opacity: item.status === 'cancelled' ? 0.8 : 1,
                }}
              >
                <div style={{ ...dayColStyle }}>
                  {item.day}
                  <span style={dayColSpanStyle}>{formatDayMonth(item.date)}</span>
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <div
                    style={{
                      font: '600 15px var(--font-body)',
                      marginBottom: 4,
                      color: item.status === 'cancelled' ? '#9AA1AF' : 'var(--text)',
                      textDecoration: item.status === 'cancelled' ? 'line-through' : 'none',
                    }}
                  >
                    {item.start_time} – {item.end_time}
                  </div>
                  <span
                    style={{
                      ...pillStyle(status.borderColor, status.textColor),
                      marginRight: 6,
                    }}
                  >
                    {status.label}
                  </span>
                  {item.tagText && (
                    <span style={pillStyle(status.borderColor, status.textColor)}>
                      {item.tagText}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onEditItem(item)}
                  style={{
                    minHeight: 44,
                    padding: '0 16px',
                    border: 0,
                    background: 'transparent',
                    color: '#9AA1AF',
                    font: '500 14px var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onCancelItem(item)}
                  style={{
                    minHeight: 44,
                    padding: '0 16px',
                    border: 0,
                    background: 'transparent',
                    color: '#9AA1AF',
                    font: '500 14px var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  {item.status === 'cancelled'
                    ? 'Restore'
                    : item.status === 'extra'
                      ? 'Remove'
                      : 'Cancel'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ margin: 0, font: '400 13px var(--font-body)', color: '#9AA1AF' }}>
        Changing or cancelling one day never touches the rest of your usual times.
      </p>
    </section>
  );
}
