import { Tooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import styles from './InfoPanel.module.css';

type InfoPanelProperties = {
  // Élément qui déclenche l'infobulle (bouton, texte focusable…).
  children: ReactElement<Record<string, unknown>>;
  content: ReactNode;
};

export const InfoPanel = ({ children, content }: InfoPanelProperties) => (
  <Tooltip.Provider delay={200}>
    <Tooltip.Root>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={6}>
          <Tooltip.Popup className={styles.popup}>{content}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);
