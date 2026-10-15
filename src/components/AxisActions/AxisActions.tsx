import { ActionButton } from '@component/ActionButton';
import type { PressHandlers } from '@component/ActionButton';
import styles from './AxisActions.module.css';

export type AxisAction = {
  id: string;
  label: string;
  detail?: string;
  reason?: string;
  isDisabled: boolean;
  // Gestes d'appui (court, long) et action du bouton.
  press: PressHandlers;
  onClick: () => void;
};

type AxisActionsProperties = {
  name: string;
  negativePole: string;
  positivePole: string;
  // À gauche : ce qui pousse l'axe vers le pôle négatif.
  negative: readonly AxisAction[];
  // À droite : ce qui le pousse vers le pôle positif.
  positive: readonly AxisAction[];
};

type ColumnProperties = {
  pole: string;
  actions: readonly AxisAction[];
};

const Column = ({ pole, actions }: ColumnProperties) => (
  <div className={styles.column}>
    <h4 className={styles.pole}>{pole}</h4>
    {actions.map((action) => (
      <ActionButton
        key={action.id}
        label={action.label}
        detail={action.detail}
        reason={action.reason}
        isDisabled={action.isDisabled}
        press={action.press}
        onClick={action.onClick}
      />
    ))}
  </div>
);

// Les actions d'un axe, sur deux colonnes : le pôle négatif à gauche, le pôle
// positif à droite, comme les extrémités du curseur de l'axe.
export const AxisActions = ({
  name,
  negativePole,
  positivePole,
  negative,
  positive,
}: AxisActionsProperties) => (
  <section aria-label={name} className={styles.section}>
    <h3 className={styles.name}>{name}</h3>
    <div className={styles.columns}>
      <Column pole={negativePole} actions={negative} />
      <Column pole={positivePole} actions={positive} />
    </div>
  </section>
);
