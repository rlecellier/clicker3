import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { PolarGauge } from '@component/PolarGauge';
import { Window } from '@component/Window';
import { useCharacterScreen } from '@hook/useCharacterScreen';
import styles from './CharacterPage.module.css';

// Onglet « Caractère » : orchestrateur de `useCharacterScreen`.
export const CharacterPage = () => {
  const screen = useCharacterScreen();

  return (
    <Window title="Caractère">
      <section aria-label="Axes" className={styles.axes}>
        {screen.axes.map((axis) => (
          <PolarGauge
            key={axis.id}
            name={axis.name}
            label={axis.label}
            negativePole={axis.negativePole}
            positivePole={axis.positivePole}
            value={axis.value}
            max={axis.max}
            marks={axis.marks}
          />
        ))}
      </section>
      {screen.traits.length === 0 ? (
        <Note>Aucun trait pour l’instant.</Note>
      ) : (
        <ItemList caption="Traits" items={screen.traits} />
      )}
    </Window>
  );
};
