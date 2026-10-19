import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { strings } from '../strings';
import { showToast } from '../utils/toast';

export function AccountPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  if (!user) return null;

  const handleDownload = async () => {
    setDownloading(true);
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
    } finally {
      setDownloading(false);
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

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            ← Back
          </button>
          <h1 style={styles.title}>Privacy &amp; data</h1>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Export your data</h2>
          <p style={styles.sectionDescription}>
            Download a JSON copy of your account, usual times, exceptions, friends, and created
            invites.
          </p>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            style={styles.downloadButton}
          >
            {downloading ? 'Preparing download...' : 'Download my data'}
          </button>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Delete your account</h2>
          <p style={styles.sectionDescription}>
            This removes your times, friend links and settings right away. It can't be undone. If
            you come back later, you'll join the waitlist again.
          </p>
          <button type="button" onClick={() => setDeleteOpen(true)} style={styles.deleteButton}>
            Delete my account
          </button>
        </div>

        {deleteOpen && (
          <>
            <div style={styles.backdrop} onClick={() => setDeleteOpen(false)} />
            <div style={styles.dialog}>
              <h2 style={styles.dialogTitle}>{strings.deleteAccount.title}</h2>
              <p style={styles.dialogDescription}>
                This removes your times, friend links and settings right away. It can't be undone.
                If you come back later, you'll join the waitlist again.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                style={styles.downloadLink}
              >
                {strings.deleteAccount.downloadFirst}
              </button>
              <div style={styles.dialogActions}>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  style={styles.dialogKeep}
                >
                  {strings.deleteAccount.keep}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteAccount}
                  style={styles.dialogDelete}
                >
                  {deleting ? 'Deleting...' : strings.deleteAccount.delete}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    marginBottom: '32px',
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-2)',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  section: {
    background: 'var(--bg-bar)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--text)',
    margin: '0 0 8px',
  },
  sectionDescription: {
    fontSize: '14px',
    color: 'var(--text-2)',
    margin: '0 0 16px',
    lineHeight: '1.5',
  },
  downloadButton: {
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--text)',
    font: '500 14px var(--font-body)',
    cursor: 'pointer',
  },
  deleteButton: {
    minHeight: '44px',
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid var(--danger)',
    background: 'transparent',
    color: 'var(--danger)',
    font: '500 14px var(--font-body)',
    cursor: 'pointer',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 60,
  },
  dialog: {
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
  },
  dialogTitle: {
    margin: 0,
    font: '700 18px var(--font-heading)',
    color: 'var(--text)',
  },
  dialogDescription: {
    margin: 0,
    font: '400 14px/1.5 var(--font-body)',
    color: 'var(--text-2)',
  },
  downloadLink: {
    alignSelf: 'flex-start',
    minHeight: 44,
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'var(--muted)',
    font: '500 13px var(--font-body)',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  dialogActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
  },
  dialogKeep: {
    minHeight: 44,
    padding: '0 16px',
    borderRadius: 10,
    border: '1px solid var(--border-strong)',
    background: 'var(--surface)',
    color: 'var(--text)',
    font: '500 14px var(--font-body)',
    cursor: 'pointer',
  },
  dialogDelete: {
    minHeight: 44,
    padding: '0 16px',
    borderRadius: 10,
    border: '1px solid var(--danger)',
    background: 'transparent',
    color: 'var(--danger)',
    font: '600 14px var(--font-body)',
    cursor: 'pointer',
    opacity: 1,
  },
};
