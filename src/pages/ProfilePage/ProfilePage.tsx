import { CharacterHeader } from '@component/CharacterHeader';
import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useProfileScreen } from '@hook/useProfileScreen';
import { useSeenTab } from '@hook/useSeenTab';
import styles from './ProfilePage.module.css';

// Onglet « Profil » : orchestrateur de `useProfileScreen`.
export const ProfilePage = () => {
  const screen = useProfileScreen();
  useSeenTab('profile');

  return (
    <>
      <Window title="Fiche du personnage">
        <CharacterHeader {...screen.header} />
        <dl className={styles.facts}>
          <Stat label="Poste" value={screen.job} />
          <Stat label="Réputation disponible" value={screen.reputation} />
        </dl>
      </Window>
      <Window title="Compétences et réputation">
        {screen.stats.map((stat) => (
          <ProgressBar
            key={stat.id}
            label={stat.label}
            value={stat.value}
            max={stat.max}
          />
        ))}
      </Window>
    </>
  );
};
