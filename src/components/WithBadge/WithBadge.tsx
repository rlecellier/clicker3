import type { ReactNode } from 'react';
import { Badge } from '@component/Badge';

type WithBadgeProperties = {
  children: ReactNode;
  // Repère affiché après le texte (ex. « Actuel », « Ouvert ») ; rien sans lui.
  badge?: string;
};

// Un titre suivi de son repère.
export const WithBadge = ({ children, badge }: WithBadgeProperties) => (
  <>
    {children}
    {badge === undefined ? null : (
      <>
        {' '}
        <Badge tone="info">{badge}</Badge>
      </>
    )}
  </>
);
