import { ActionList } from '@component/ActionList';
import { AxisActions } from '@component/AxisActions';
import { Note } from '@component/Note';
import { ObjectStrip } from '@component/ObjectStrip';
import { Window } from '@component/Window';
import { useHouseScreen } from '@hook/useHouseScreen';
import styles from './HousePage.module.css';

// Onglet « Maison » : orchestrateur de `useHouseScreen`.
export const HousePage = () => {
  const screen = useHouseScreen();

  return (
    <Window title="Maison">
      <ObjectStrip
        label="Objets"
        items={screen.objects}
        more={{ to: screen.inventoryPath, label: 'Ouvrir l’inventaire' }}
      />
      <Note>{screen.hint}</Note>
      {screen.feedback === null ? null : <p role="status">{screen.feedback}</p>}
      <div className={styles.sections}>
        {screen.axes.map((axis) => (
          <AxisActions
            key={axis.id}
            name={axis.name}
            negativePole={axis.negativePole}
            positivePole={axis.positivePole}
            negative={axis.negative}
            positive={axis.positive}
          />
        ))}
        {screen.others.map((section) => (
          <ActionList
            key={section.caption}
            caption={section.caption}
            actions={section.actions}
          />
        ))}
      </div>
    </Window>
  );
};
