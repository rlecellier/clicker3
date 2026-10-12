import { ResourceIcon } from '@component/ResourceIcon';
import styles from './ReputationStars.module.css';

type ReputationStarsProperties = {
  // Étoiles pleines, sur `max` ; texte lu à la place des étoiles.
  tier: number;
  max: number;
  label: string;
};

// Les paliers de réputation en étoiles pleines ou vides.
export const ReputationStars = ({
  tier,
  max,
  label,
}: ReputationStarsProperties) => (
  <span className={styles.stars} role="img" aria-label={label} title={label}>
    {Array.from({ length: max }, (_, index) => (
      <ResourceIcon key={index} id={index < tier ? 'star' : 'star-empty'} />
    ))}
  </span>
);
