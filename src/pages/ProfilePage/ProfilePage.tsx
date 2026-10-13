import { CharacterHeader } from '@component/CharacterHeader';
import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { SleepPicker } from '@component/SleepPicker';
import { Stat } from '@component/Stat';
import { Tabs } from '@component/Tabs';
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
      <Window title="Sommeil">
        <SleepPicker
          options={screen.sleep.options}
          value={screen.sleep.value}
          onChange={screen.sleep.select}
          summary={screen.sleep.summary}
        />
      </Window>
      <Window title="Compétences et améliorations">
        <Tabs
          tabs={[
            {
              id: 'skills',
              label: 'Compétences',
              content: screen.stats.map((stat) => (
                <ProgressBar
                  key={stat.id}
                  label={stat.label}
                  value={stat.value}
                  max={stat.max}
                />
              )),
            },
            {
              id: 'upgrades',
              label: 'Améliorations',
              content:
                screen.upgrades.length === 0 ? (
                  <Note>Plus d’amélioration personnelle à acheter.</Note>
                ) : (
                  <ItemList
                    caption="Améliorations personnelles"
                    items={screen.upgrades}
                  />
                ),
            },
          ]}
        />
      </Window>
    </>
  );
};
