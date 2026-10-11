import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useGameScreen } from '@hook/useGameScreen';
import styles from './SkillsPage.module.css';

// Onglet « Compétences » : orchestrateur de `useGameScreen`.
export const SkillsPage = () => {
  const screen = useGameScreen();

  return (
    <Window title="Compétences et réputation">
      {screen.stats.map((stat) => (
        <ProgressBar
          key={stat.id}
          label={stat.label}
          value={stat.value}
          max={stat.max}
        />
      ))}
      <dl className={styles.reputation}>
        <Stat
          label="Réputation disponible"
          value={screen.counters.reputation}
        />
      </dl>
    </Window>
  );
};
