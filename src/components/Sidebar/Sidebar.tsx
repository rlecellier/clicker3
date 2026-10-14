import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { Badge } from '@component/Badge';
import { InfoPanel } from '@component/InfoPanel';
import styles from './Sidebar.module.css';

export type SidebarItem = {
  id: string;
  label: string;
  // Pictogramme décoratif (SVG) : le libellé reste porté par `aria-label`.
  icon: ReactNode;
  to: string;
  // Pastille de l'onglet (non lus, nouveautés) ; rien si absente ou nulle.
  badge?: number | string;
  // Nom accessible, quand il doit en dire plus que le libellé (« Courrier,
  // 3 messages non lus »).
  accessibleLabel?: string;
  // Touche qui ouvre l'onglet : ajoutée à l'infobulle et à `aria-keyshortcuts`.
  shortcut?: string;
  badgeTone?: 'neutral' | 'info' | 'alert';
};

type SidebarProperties = {
  label: string;
  items: readonly SidebarItem[];
  // Lien à l'écart, en bas de la barre.
  footer?: SidebarItem;
};

type SidebarLinkProperties = {
  item: SidebarItem;
  // Libellé visible même sous 40 rem (menu Démarrer).
  showLabel?: boolean;
  onClick?: () => void;
};

// Lien de navigation d'un onglet ; sous 40 rem, icône seule sauf `showLabel`.
export const SidebarLink = ({
  item,
  showLabel = false,
  onClick,
}: SidebarLinkProperties) => (
  <InfoPanel
    content={
      item.shortcut === undefined
        ? item.label
        : `${item.label} (${item.shortcut})`
    }
  >
    <NavLink
      to={item.to}
      className={showLabel ? `${styles.link} ${styles.withLabel}` : styles.link}
      onClick={onClick}
      aria-label={item.accessibleLabel ?? item.label}
      aria-keyshortcuts={item.shortcut}
    >
      <span className={styles.icon} aria-hidden="true">
        {item.icon}
      </span>
      <span className={styles.label} aria-hidden="true">
        {item.label}
      </span>
      {item.badge === undefined || item.badge === 0 ? null : (
        <span className={styles.badge}>
          <Badge tone={item.badgeTone}>{item.badge}</Badge>
        </span>
      )}
    </NavLink>
  </InfoPanel>
);

// Navigation à gauche : libellés en grand, icônes seules sous 40 rem (ADR 0008).
// L'onglet actif vient de l'URL : ce sont de vrais liens (`aria-current`).
export const Sidebar = ({ label, items, footer }: SidebarProperties) => (
  <nav className={styles.sidebar} aria-label={label}>
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <SidebarLink item={item} />
        </li>
      ))}
    </ul>
    {footer === undefined ? null : (
      <div className={styles.footer}>
        <SidebarLink item={footer} />
      </div>
    )}
  </nav>
);
