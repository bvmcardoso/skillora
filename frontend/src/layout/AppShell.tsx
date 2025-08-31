import React from 'react';
import styles from './AppShell.module.scss';

export type View = 'upload' | 'dashboard';

type Props = {
  view: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
};

function AppShell({ view, onChangeView, children }: Props) {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.header__title}>Skillora Analytics</h1>
        <nav className={styles.header__nav}>
          <button
            className={`${styles.header__tab} ${
              view === 'upload' ? styles['header__tab-active'] : ''
            }`}
            onClick={() => onChangeView('upload')}
          >
            Upload
          </button>
          <button
            className={`${styles.header__tab} ${
              view === 'dashboard' ? styles['header__tab--active'] : ''
            }`}
            onClick={() => onChangeView('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <small>Created by Bruno Cardoso</small>
      </footer>
    </div>
  );
}

export default AppShell;
