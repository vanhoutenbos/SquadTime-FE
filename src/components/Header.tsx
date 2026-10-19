import { config } from '../config';

interface HeaderProps {
  right?: React.ReactNode;
}

export function Header({ right }: HeaderProps) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <img src="/logo.png" alt="SquadTime logo" style={styles.logo} />
        <h1 style={styles.title}>{config.productName}</h1>
      </div>
      <div style={styles.headerRight}>{right}</div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '14px 32px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-bar)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
  },
  title: {
    margin: 0,
    font: '700 20px var(--font-heading)',
    color: 'var(--text)',
  },
  headerRight: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px',
  },
};
