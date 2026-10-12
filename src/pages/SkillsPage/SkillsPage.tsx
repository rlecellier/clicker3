import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useSkillsScreen } from '@hook/useSkillsScreen';
import { useSeenTab } from '@hook/useSeenTab';
import styles from './SkillsPage.module.css';

// Onglet « Compétences » : orchestrateur de `useSkillsScreen`.
export const SkillsPage = () => {
  const screen = useSkillsScreen();
  useSeenTab('skills');

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
        <Stat label="Réputation disponible" value={screen.reputation} />
      </dl>
    </Window>
  );
};
