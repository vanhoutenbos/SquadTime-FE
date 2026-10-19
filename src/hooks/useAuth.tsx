import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface User {
  discord_id: string;
  display_name: string;
  timezone: string;
  sharing: boolean;
  has_access: boolean;
  waitlist_joined_at: number | null;
  consent_at: number | null;
}

export type { User };

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  demoMode: boolean;
  toggleDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo user data
const DEMO_USER: User = {
  discord_id: '123456789012345678',
  display_name: 'DemoUser',
  timezone: 'Europe/Amsterdam',
  sharing: true,
  has_access: true,
  waitlist_joined_at: null,
  consent_at: Date.now(),
};

const DEMO_FRIENDS: User[] = [
  {
    discord_id: '223456789012345678',
    display_name: 'Alice Chen',
    timezone: 'America/New_York',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '323456789012345678',
    display_name: 'Bob Martinez',
    timezone: 'America/Los_Angeles',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '423456789012345678',
    display_name: 'Charlie Wilson',
    timezone: 'Europe/London',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '523456789012345678',
    display_name: 'Diana Kumar',
    timezone: 'Asia/Kolkata',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '623456789012345678',
    display_name: 'Erik Andersson',
    timezone: 'Europe/Stockholm',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '723456789012345678',
    display_name: 'Fatima Al-Said',
    timezone: 'Asia/Dubai',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '823456789012345678',
    display_name: 'George Park',
    timezone: 'Asia/Seoul',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '923456789012345678',
    display_name: 'Hannah Berg',
    timezone: 'Europe/Berlin',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '1023456789012345678',
    display_name: 'Ivan Petrov',
    timezone: 'Europe/Moscow',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
  {
    discord_id: '1123456789012345678',
    display_name: 'Julia Santos',
    timezone: 'America/Sao_Paulo',
    sharing: true,
    has_access: true,
    waitlist_joined_at: null,
    consent_at: Date.now(),
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const demoModeRef = useRef(demoMode);
  useEffect(() => {
    demoModeRef.current = demoMode;
  }, [demoMode]);

  // Check for demo mode in URL or localStorage - run synchronously on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const demoFromUrl = urlParams.get('demo') === '1';
    const demoFromStorage = localStorage.getItem('squadtime_demo') === '1';
    const isDemo = demoFromUrl || demoFromStorage;

    if (isDemo) {
      setDemoMode(true);
      setUser(DEMO_USER);
      setLoading(false);
      // Clean URL
      if (demoFromUrl) {
        urlParams.delete('demo');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      // Not demo mode - start loading real user
      fetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = useCallback(async () => {
    if (demoModeRef.current) return; // Skip fetch in demo mode

    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setLoading(false);
  };
  const logout = () => {
    setUser(null);
    setDemoMode(false);
    setLoading(false);
    localStorage.removeItem('squadtime_demo');
  };

  const toggleDemoMode = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);
    demoModeRef.current = newDemoMode;
    if (newDemoMode) {
      setUser(DEMO_USER);
      setLoading(false);
      localStorage.setItem('squadtime_demo', '1');
    } else {
      setUser(null);
      setLoading(true);
      localStorage.removeItem('squadtime_demo');
      fetchUser();
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} aria-label="Loading..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser: fetchUser, demoMode, toggleDemoMode }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function useDemoFriends() {
  const { demoMode } = useAuth();
  return demoMode ? DEMO_FRIENDS : [];
}

const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--amber)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
