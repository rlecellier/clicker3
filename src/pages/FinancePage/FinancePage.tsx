import { BankerDialog } from '@component/BankerDialog';
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
        Total des comptes : <strong>{finance.total}</strong> · Compte courant :{' '}
        <strong>{finance.checking}</strong> (matelas {finance.buffer}) · Capital
        placé : <strong>{finance.capital}</strong> · Rendement attendu :{' '}
        <strong>{finance.yield}</strong> par mois
      </p>
      <Note>
        La répartition est automatique : le compte courant garde de quoi vivre
        deux mois, le surplus remplit le Livret A, puis le PEL, puis le
        compte-titres, dans la limite de leur plafond. Les dépenses puisent
        d’abord dans le compte courant, puis dans le compte le moins
        rémunérateur.
      </Note>
      <ItemList caption="Placements" items={finance.items} />
      {finance.dialog && <BankerDialog {...finance.dialog} />}
    </Window>
  );
};
