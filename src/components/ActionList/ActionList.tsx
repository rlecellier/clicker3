import { ActionButton } from '@component/ActionButton';
import type { AxisAction } from '@component/AxisActions';
import styles from './ActionList.module.css';

type ActionListProperties = {
  caption: string;
  actions: readonly AxisAction[];
};

// Des actions sur une colonne, sous un titre : celles qui ne poussent aucun
// axe (sortir, demander).
export const ActionList = ({ caption, actions }: ActionListProperties) => (
  <section aria-label={caption} className={styles.section}>
    <h3 className={styles.caption}>{caption}</h3>
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
  </section>
);
