import { createRoot } from 'react-dom/client';

interface ToastOptions {
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'info';
}

export function showToast({ message, duration = 3000, type = 'success' }: ToastOptions) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toastEl = document.createElement('div');
  container.appendChild(toastEl);

  const bgColor =
    type === 'error' ? 'var(--danger)' : type === 'info' ? 'var(--text)' : 'var(--amber)';
  const textColor = type === 'error' || type === 'success' ? 'var(--bg)' : 'var(--bg)';

  const Toast = () => (
    <div
      style={{
        background: bgColor,
        color: textColor,
        padding: '12px 20px',
        borderRadius: '999px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease-out',
        pointerEvents: 'auto',
      }}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );

  const root = createRoot(toastEl);
  root.render(<Toast />);

  // Remove after duration
  setTimeout(() => {
    toastEl.style.animation = 'slideDown 0.3s ease-in';
    setTimeout(() => {
      root.unmount();
      toastEl.remove();

      // Remove container if empty
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, duration);
}

// Add animations to document if not already present
if (typeof document !== 'undefined') {
  const styleId = 'toast-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideDown {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
