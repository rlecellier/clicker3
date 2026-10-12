import { ProgressBar } from '@component/ProgressBar';
import { ReputationStars } from '@component/ReputationStars';
import { ResourceBar } from '@component/ResourceBar';
import styles from './GameHeader.module.css';

type GameHeaderProperties = {
  resources: Parameters<typeof ResourceBar>[0];
  reputation: Parameters<typeof ReputationStars>[0];
  date: string;
  gauge: { value: number; max: number };
};

// En-tête fixe de l'écran de jeu, sur toute la largeur : les ressources sur
// une ligne, puis la date, avec la réputation à sa droite, dont la barre se
// remplit au fil de la période.
export const GameHeader = ({
  resources,
  reputation,
  date,
  gauge,
}: GameHeaderProperties) => (
  <header className={styles.header}>
    <ResourceBar {...resources} />
    <ProgressBar
      size="small"
      aside={<ReputationStars {...reputation} />}
      label={date}
      value={gauge.value}
      max={gauge.max}
    />
  </header>
);
