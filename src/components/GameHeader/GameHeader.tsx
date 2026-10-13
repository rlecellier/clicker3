import { ProgressBar } from '@component/ProgressBar';
import { ResourceBar } from '@component/ResourceBar';
import styles from './GameHeader.module.css';

type GameHeaderProperties = {
  resources: Parameters<typeof ResourceBar>[0];
  date: string;
  // Ce que fait le personnage, en quelques mots.
  activity: string;
  gauge: {
    value: number;
    max: number;
    segments: Parameters<typeof ProgressBar>[0]['segments'];
  };
};

// En-tête fixe de l'écran de jeu, sur toute la largeur : les ressources sur
// une ligne, puis la date, avec l'activité en cours à sa droite, dont la barre
// se remplit au fil de la période.
export const GameHeader = ({
  resources,
  date,
  activity,
  gauge,
}: GameHeaderProperties) => (
  <header className={styles.header}>
    <ResourceBar {...resources} />
    <ProgressBar
      size="small"
      aside={<span className={styles.activity}>{activity}</span>}
      label={date}
      value={gauge.value}
      max={gauge.max}
      segments={gauge.segments}
    />
  </header>
);
