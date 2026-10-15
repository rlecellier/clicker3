import { ActionButton } from '@component/ActionButton';
import { Button } from '@component/Button';
import { FigureList } from '@component/FigureList';
import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useEarlyChildhoodScreen } from '@hook/useEarlyChildhoodScreen';
import styles from './EarlyChildhoodPage.module.css';

// Onglet « Vie » de la petite enfance : orchestrateur de `useEarlyChildhoodScreen`.
export const EarlyChildhoodPage = () => {
  const screen = useEarlyChildhoodScreen();

  // À 6 ans, le carnet de santé remplace le jeu.
  if (screen.report !== null) {
    return (
      <Window title={screen.report.title}>
        <Note>{screen.report.intro}</Note>
        <FigureList figures={screen.report.figures} />
        {screen.report.traits.length === 0 ? (
          <Note>Aucun trait relevé.</Note>
        ) : (
          <ItemList caption="Traits" items={screen.report.traits} />
        )}
        <ItemList caption="Entourage" items={screen.report.people} />
        <div className={styles.actions}>
          <Button variant="primary" size="large" onClick={screen.report.enter}>
            {screen.report.enterLabel}
          </Button>
        </div>
      </Window>
    );
  }

  return (
    <Window title={screen.title}>
      <Note>
        {screen.ages} · {screen.age}
      </Note>
      <dl className={styles.counter}>
        <Stat label="Éveil" value={screen.awakening} />
      </dl>
      {screen.attention.isVisible ? (
        <div className={styles.gauges}>
          <ProgressBar
            label="Attention des parents"
            value={screen.attention.value}
            max={screen.attention.max}
            size="small"
          />
        </div>
      ) : null}
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
    </Window>
  );
};
