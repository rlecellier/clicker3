import { ActionButton } from '@component/ActionButton';
import { FigureList } from '@component/FigureList';
import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { Stat } from '@component/Stat';
import { Window } from '@component/Window';
import { useGrowthScreen } from '@hook/useGrowthScreen';
import styles from './GrowthPage.module.css';

// Onglet « Vie » d'une tranche avant 18 ans : orchestrateur de `useGrowthScreen`.
export const GrowthPage = () => {
  const screen = useGrowthScreen();

  return (
    <Window title={screen.title}>
      <Note>{screen.ages}</Note>
      <dl className={styles.counter}>
        <Stat label={screen.counterLabel} value={screen.count} />
      </dl>
      {screen.inherited === null ? null : (
        <>
          <Note>Hérité de la petite enfance :</Note>
          <FigureList figures={screen.inherited.figures} />
          {screen.inherited.traits.length === 0 ? null : (
            <ItemList caption="Traits" items={screen.inherited.traits} />
          )}
        </>
      )}
      <ActionButton
        label={screen.actionLabel}
        variant="primary"
        press={screen.press}
        onClick={screen.run}
      />
    </Window>
  );
};
