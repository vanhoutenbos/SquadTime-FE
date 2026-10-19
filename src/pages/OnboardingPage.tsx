import { useState } from 'react';
import { config } from '../config';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [timezone, setTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ageConfirmed) {
      setError('You must confirm you are 16 or older');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy');
      return;
    }
    if (!timezone) {
      setError('Please select a timezone');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ timezone, consent_version: '1.0' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to {config.productName}</h1>
        <p style={styles.subtitle}>Let's get you set up</p>

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Timezone</legend>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={styles.select}
              required
            >
              {commonTimezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p style={styles.hint}>
              All times are converted to your timezone. We detected <strong>{timezone}</strong>.
            </p>
          </fieldset>

          <fieldset style={styles.fieldset}>
            <legend style={styles.legend}>Confirmations</legend>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                style={styles.checkbox}
                required
              />
              <span style={styles.checkboxText}>
                I am <strong>16 years or older</strong>
              </span>
            </label>

            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={styles.checkbox}
                required
              />
              <span style={styles.checkboxText}>
                I accept the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" style={styles.link}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" style={styles.link}>
                  Privacy Policy
                </a>
              </span>
            </label>
          </fieldset>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

const commonTimezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Europe/Rome (CET/CEST)' },
  { value: 'Europe/Warsaw', label: 'Europe/Warsaw (CET/CEST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'America/Toronto', label: 'America/Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'America/Vancouver (PST/PDT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
  { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '32px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: '0 0 24px',
    textAlign: 'center',
  },
  error: {
    background: 'rgba(255, 138, 138, 0.1)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'left',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldset: {
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px',
    margin: 0,
    textAlign: 'left',
  },
  legend: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--text-2)',
    padding: '0 8px',
    marginLeft: '8px',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border-strong)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginTop: '8px',
  },
  hint: {
    fontSize: '12px',
    color: 'var(--muted)',
    margin: '8px 0 0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: '1.5',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--amber)',
    flexShrink: 0,
    marginTop: '2px',
  },
  checkboxText: {
    fontSize: '14px',
    color: 'var(--text)',
  },
  link: {
    color: 'var(--amber)',
    textDecoration: 'underline',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    background: 'var(--amber)',
    color: '#1A1203',
    border: 'none',
    borderRadius: '999px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    marginTop: '8px',
  },
};
