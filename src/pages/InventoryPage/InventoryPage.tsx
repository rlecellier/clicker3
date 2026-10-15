import { Note } from '@component/Note';
import { ObjectDetail } from '@component/ObjectDetail';
import { ObjectGrid } from '@component/ObjectGrid';
import { PageLink } from '@component/PageLink';
import { Window } from '@component/Window';
import { useInventoryScreen } from '@hook/useInventoryScreen';
import styles from './InventoryPage.module.css';

// Page « Inventaire » (sous la Maison) : orchestrateur de `useInventoryScreen`.
export const InventoryPage = () => {
  const screen = useInventoryScreen();

  return (
    <Window title="Inventaire">
      <PageLink to={screen.backPath}>← Maison</PageLink>
      <div className={styles.detail}>
        {screen.detail === undefined ? (
          <Note minLines={3}>Touchez un objet pour savoir ce qu’il fait.</Note>
        ) : (
          <ObjectDetail {...screen.detail} />
        )}
      </div>
      <ObjectGrid
        label="Objets de l’inventaire"
        items={screen.items}
        selectedId={screen.selectedId}
        onSelect={screen.select}
      />
    </Window>
  );
};
