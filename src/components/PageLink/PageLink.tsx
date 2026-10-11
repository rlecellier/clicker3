import type { ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './PageLink.module.css';

type PageLinkProperties = { to: string; children: ReactNode };

// Lien de navigation d'allure bouton.
export const PageLink = ({ to, children }: PageLinkProperties) => (
  <Link className={styles.link} to={to}>
    {children}
  </Link>
);
