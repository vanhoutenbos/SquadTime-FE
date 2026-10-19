import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { generateAndCopyInvite } from '../utils/invite';
import { showToast } from '../utils/toast';
import { strings } from '../strings';
import { config } from '../config';

interface MenuItem {
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}

export function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
    logout();
    navigate('/');
  };

  const handleDownload = async () => {
    setOpen(false);
    try {
      const res = await fetch('/api/user/data', { credentials: 'include' });
      if (!res.ok) {
        showToast({ message: 'Failed to download data', type: 'error' });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'squadtime-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      showToast({ message: 'Failed to download data', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteOpen(false);
    setDeleting(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        showToast({ message: 'Failed to delete account', type: 'error' });
        return;
      }
    } catch {
      showToast({ message: 'Failed to delete account', type: 'error' });
      return;
    } finally {
      setDeleting(false);
    }
    logout();
    navigate('/');
  };

  const handleInvite = async () => {
    setOpen(false);
    const ok = await generateAndCopyInvite();
    showToast({
      message: ok ? strings.invite.copied : 'Failed to copy invite',
      type: ok ? 'success' : 'error',
    });
  };

  const items: MenuItem[] = [
    {
      label: 'My times',
      hint: 'Edit your usual times and single days',
      onClick: () => {
        closeMenu();
        navigate('/add-times');
      },
    },
    {
      label: 'Invite friends',
      hint: 'Copies an invite message to share',
      onClick: handleInvite,
    },
    {
      label: 'Settings',
      hint: 'Timezone and sharing',
      onClick: () => {
        closeMenu();
        navigate('/settings');
      },
    },
    {
      label: 'Privacy & data',
      hint: 'What we store, and download your data',
      onClick: () => {
        closeMenu();
        navigate('/account');
      },
    },
    {
      label: 'Join the community',
      hint: 'Updates and feedback on Discord',
      onClick: () => {
        closeMenu();
        window.open(config.discordInviteUrl, '_blank', 'noopener,noreferrer');
      },
    },
  ];

  const name = user?.display_name || 'You';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--border)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: '600 13px var(--font-body)',
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        ME
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            zIndex: 50,
            minWidth: 220,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px 12px',
              borderBottom: '1px solid var(--border)',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                flex: '0 0 36px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                font: '600 13px var(--font-body)',
              }}
            >
              ME
            </span>
            <span>
              <div style={{ font: '600 14px var(--font-body)', color: 'var(--text)' }}>{name}</div>
              <div style={{ font: '400 12px var(--font-body)', color: 'var(--muted)' }}>
                Signed in with Discord
              </div>
            </span>
          </div>
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={item.onClick}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
                width: '100%',
                minHeight: 44,
                padding: '8px 14px',
                border: 0,
                borderRadius: 8,
                background: 'transparent',
                color: item.danger ? 'var(--danger)' : 'var(--text)',
                font: '600 14px var(--font-body)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {item.label}
              {item.hint && (
                <small style={{ font: '400 12px var(--font-body)', color: 'var(--muted)' }}>
                  {item.hint}
                </small>
              )}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border-strong)', margin: '6px 0' }} />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              width: '100%',
              minHeight: 44,
              padding: '8px 14px',
              border: 0,
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--text)',
              font: '600 14px var(--font-body)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            Log out
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDeleteOpen(true);
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              width: '100%',
              minHeight: 44,
              padding: '8px 14px',
              border: 0,
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--danger)',
              font: '600 14px var(--font-body)',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            Delete my account
            <small style={{ font: '400 12px var(--font-body)', color: 'var(--muted)' }}>
              Removes all your data
            </small>
          </button>
        </div>
      )}

      {deleteOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 60,
            }}
            onClick={() => setDeleteOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 360,
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 16,
              padding: 20,
              zIndex: 61,
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <h2 style={{ margin: 0, font: '700 18px var(--font-heading)', color: 'var(--text)' }}>
              {strings.deleteAccount.title}
            </h2>
            <p style={{ margin: 0, font: '400 14px/1.5 var(--font-body)', color: 'var(--text-2)' }}>
              This removes your times, friend links and settings right away. It can't be undone. If
              you come back later, you'll join the waitlist again.
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              style={{
                alignSelf: 'flex-start',
                minHeight: 44,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--muted)',
                font: '500 13px var(--font-body)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {strings.deleteAccount.downloadFirst}
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                style={{
                  minHeight: 44,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border-strong)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  font: '500 14px var(--font-body)',
                  cursor: 'pointer',
                }}
              >
                {strings.deleteAccount.keep}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                style={{
                  minHeight: 44,
                  padding: '0 16px',
                  borderRadius: 10,
                  border: '1px solid var(--danger)',
                  background: 'transparent',
                  color: 'var(--danger)',
                  font: '600 14px var(--font-body)',
                  cursor: 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Deleting...' : strings.deleteAccount.delete}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
