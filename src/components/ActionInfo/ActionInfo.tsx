import styles from './ActionInfo.module.css';

type ActionInfoProperties = {
  // Coût ou effet attendu.
  detail?: string;
  // Raison lisible quand l'action est impossible : remplace le détail.
  reason?: string;
  isDisabled: boolean;
};

// Ligne sous un bouton d'action : la raison si l'action est impossible, sinon
// le détail. Deux lignes réservées, le texte complet en infobulle.
export const ActionInfo = ({
  detail,
  reason,
  isDisabled,
}: ActionInfoProperties) => (
  <div className={styles.info}>
    {isDisabled && reason !== undefined ? (
      <p className={styles.reason} title={reason}>
        {reason}
      </p>
    ) : (
      detail !== undefined && (
        <p className={styles.detail} title={detail}>
          {detail}
        </p>
      )
    )}
  </div>
);
