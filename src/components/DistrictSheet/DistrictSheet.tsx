import { Badge } from '@component/Badge';
import { Button } from '@component/Button';
import { ImpactGauges } from '@component/ImpactGauges';
import type { Gauge } from '@component/ImpactGauges';
import styles from './DistrictSheet.module.css';

type DistrictSheetProperties = {
  name: string;
  description: string;
  // Coût et condition de déblocage.
  detail: string;
  // Repère affiché à côté du nom (ex. « Ouvert »).
  badge?: string;
  actionLabel: string;
  isDisabled: boolean;
  reason?: string;
  onAction: () => void;
  // Indicateurs du quartier, seulement s'il est ouvert.
  gauges: readonly Gauge[];
};

// Fiche d'un quartier sélectionné sur la carte.
export const DistrictSheet = ({
  name,
  description,
  detail,
  badge,
  actionLabel,
  isDisabled,
  reason,
  onAction,
  gauges,
}: DistrictSheetProperties) => (
  <section className={styles.sheet} aria-label={`Fiche : ${name}`}>
    <h3 className={styles.name}>
      {name}
      {badge === undefined ? null : (
        <>
          {' '}
          <Badge tone="info">{badge}</Badge>
        </>
      )}
    </h3>
    <p>{description}</p>
    <p className={styles.detail}>{detail}</p>
    {gauges.length === 0 ? null : (
      <ImpactGauges caption="Impact du quartier" gauges={gauges} />
    )}
    <Button isDisabled={isDisabled} onClick={onAction}>
      {actionLabel}
    </Button>
    {isDisabled && reason !== undefined ? (
      <p className={styles.reason}>{reason}</p>
    ) : null}
  </section>
);
