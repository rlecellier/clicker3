import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { Window } from '@component/Window';
import { useFinanceScreen } from '@hook/useFinanceScreen';

// Onglet « Finance » : orchestrateur de `useFinanceScreen`.
export const FinancePage = () => {
  const finance = useFinanceScreen();

  return (
    <Window title="Finance">
      <p>
        Compte courant : <strong>{finance.checking}</strong> · Capital placé :{' '}
        <strong>{finance.capital}</strong> · Rendement attendu :{' '}
        <strong>{finance.yield}</strong> par mois
      </p>
      <Note>
        Le rendement tombe sur le compte courant à chaque période. Le capital
        placé se reprend à tout moment, et couvre vos dépenses si l’argent
        manque.
      </Note>
      <ItemList caption="Placements" items={finance.items} />
    </Window>
  );
};
