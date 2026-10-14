import { ActionButton } from '@component/ActionButton';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useEarlyChildhoodScreen } from '@hook/useEarlyChildhoodScreen';
import styles from './EarlyChildhoodPage.module.css';

// Onglet « Vie » de la petite enfance : orchestrateur de `useEarlyChildhoodScreen`.
export const EarlyChildhoodPage = () => {
  const screen = useEarlyChildhoodScreen();

  return (
    <Window title={screen.title}>
      <Note>
        {screen.ages} · {screen.age}
      </Note>
      <dl className={styles.counter}>
        <Stat label="Éveil" value={screen.awakening} />
      </dl>
      <section aria-label="Caractère" className={styles.axes}>
        {screen.axes.map((axis) => (
          <ProgressBar
            key={axis.id}
            label={axis.label}
            value={axis.value}
            max={axis.max}
            size="small"
          />
        ))}
        {screen.attention.isVisible ? (
          <ProgressBar
            label="Attention des parents"
            value={screen.attention.value}
            max={screen.attention.max}
            size="small"
          />
        ) : null}
      </section>
      {screen.traits.length === 0 ? null : (
        <Note>Traits : {screen.traits.join(', ')}</Note>
      )}
      <div className={styles.actions}>
        <ActionButton
          label="Gazouiller"
          variant="primary"
          isDisabled={screen.isOver}
          press={screen.babble.press}
          onClick={screen.babble.run}
        />
        {screen.favorites.map((favorite) => (
          <ActionButton
            key={favorite.id}
            label={favorite.label}
            detail={favorite.detail}
            reason={favorite.reason}
            isDisabled={favorite.isDisabled}
            onClick={favorite.run}
          />
        ))}
      </div>
      {screen.feedback === null ? null : <p role="status">{screen.feedback}</p>}
      {screen.hasHouse && screen.favorites.length === 0 ? (
        <Note>
          Ouvrez la Maison pour mettre vos activités préférées en favori.
        </Note>
      ) : null}
      {screen.isOver ? <Note>{screen.overText}</Note> : null}
    </Window>
  );
};
