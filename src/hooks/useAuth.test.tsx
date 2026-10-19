import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, useDemoFriends } from './useAuth';

function AuthConsumer() {
  const auth = useAuth();
  return (
    <div data-testid="auth-root">
      <span data-testid="user">{auth.user ? auth.user.display_name : 'none'}</span>
      <span data-testid="loading">{auth.loading ? 'true' : 'false'}</span>
      <span data-testid="demo">{auth.demoMode ? 'true' : 'false'}</span>
      <button
        data-testid="login"
        onClick={() =>
          auth.login({
            discord_id: 'u1',
            display_name: 'Alice',
            timezone: 'UTC',
            sharing: true,
            has_access: true,
            waitlist_joined_at: null,
            consent_at: Date.now(),
          })
        }
      >
        login
      </button>
      <button data-testid="logout" onClick={auth.logout}>
        logout
      </button>
      <button data-testid="toggle" onClick={auth.toggleDemoMode}>
        toggle
      </button>
      <button data-testid="refresh" onClick={() => auth.refreshUser()}>
        refresh
      </button>
    </div>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
  window.history.replaceState = vi.fn();
  (globalThis.fetch as unknown as ReturnType<typeof vi.fn>) = vi.fn();
});

describe('AuthProvider', () => {
  it('renders and exposes auth context', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('auth-root'));
  });

  it('login sets user and stops loading', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('toggle'));
    fireEvent.click(screen.getByTestId('login'));
    expect(screen.getByTestId('user').textContent).toBe('Alice');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('toggleDemoMode activates demo mode', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('toggle'));
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.getByTestId('demo').textContent).toBe('true'));
    expect(screen.getByTestId('user').textContent).toBe('DemoUser');
  });

  it('toggleDemoMode deactivates demo and triggers fetch (stale-closure fix)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        discord_id: 'r1',
        display_name: 'Real',
        timezone: 'UTC',
        sharing: true,
        has_access: true,
        waitlist_joined_at: null,
        consent_at: Date.now(),
      }),
    } as Response);
    localStorage.setItem('squadtime_demo', '1');
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('toggle'));
    expect(screen.getByTestId('demo').textContent).toBe('true');
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.getByTestId('demo').textContent).toBe('false'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('Real'));
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/user',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('refreshUser skips fetch when in demo (ref updated synchronously)', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('toggle'));
    // The initial (non-demo) load performs one fetch; ignore it.
    vi.mocked(globalThis.fetch).mockClear();
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.getByTestId('demo').textContent).toBe('true'));
    fireEvent.click(screen.getByTestId('refresh'));
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(globalThis.fetch).not.toHaveBeenCalledWith('/api/user', expect.anything());
  });

  it('logout clears user, demo mode, and localStorage', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('toggle'));
    fireEvent.click(screen.getByTestId('toggle'));
    await waitFor(() => expect(screen.getByTestId('demo').textContent).toBe('true'));
    fireEvent.click(screen.getByTestId('logout'));
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('demo').textContent).toBe('false');
    expect(localStorage.getItem('squadtime_demo')).toBeNull();
  });

  it('useDemoFriends returns empty list outside demo mode', async () => {
    function DemoTest() {
      const friends = useDemoFriends();
      return <span data-testid="fr">{friends.length}</span>;
    }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);
    render(
      <AuthProvider>
        <DemoTest />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('fr'));
    expect(screen.getByTestId('fr').textContent).toBe('0');
  });

  it('useDemoFriends returns the demo roster in demo mode', async () => {
    function DemoTest() {
      const friends = useDemoFriends();
      return <span data-testid="fr">{friends.length}</span>;
    }
    localStorage.setItem('squadtime_demo', '1');
    render(
      <AuthProvider>
        <DemoTest />
      </AuthProvider>
    );
    await waitFor(() => screen.getByTestId('fr'));
    expect(Number(screen.getByTestId('fr').textContent)).toBeGreaterThan(0);
  });
});
