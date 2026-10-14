import type { ReactNode } from 'react';
import { Badge } from '@component/Badge';
import { SidebarIcon, SidebarLink } from '@component/Sidebar';
import type { SidebarItem } from '@component/Sidebar';
import styles from './Taskbar.module.css';

type TaskbarProperties = {
  label: string;
  // Onglets épinglés, en icônes seules.
  items: readonly SidebarItem[];
  start: {
    label: string;
    // Nom accessible, quand il en dit plus que le libellé.
    accessibleLabel?: string;
    // Onglets du menu qui ont du nouveau ; rien si absent ou nul.
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
  };
  // Menu Démarrer, posé au-dessus de la barre quand il est ouvert.
  menu?: ReactNode;
};

// Barre des tâches en bas de l'écran (mobile) : le bouton Démarrer à gauche,
// les onglets épinglés à côté (ADR 0008).
export const Taskbar = ({ label, items, start, menu }: TaskbarProperties) => (
  <div className={styles.wrapper}>
    {menu}
    <nav className={styles.bar} aria-label={label}>
      <button
        type="button"
        className={styles.start}
        aria-expanded={start.isOpen}
        aria-label={start.accessibleLabel ?? start.label}
        onClick={start.onToggle}
      >
        <SidebarIcon id="start" />
        <span aria-hidden="true">{start.label}</span>
        {start.badge === undefined || start.badge === 0 ? null : (
          <span className={styles.badge}>
            <Badge tone="info">{start.badge}</Badge>
          </span>
        )}
      </button>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <SidebarLink item={item} />
          </li>
        ))}
      </ul>
    </nav>
  </div>
);
