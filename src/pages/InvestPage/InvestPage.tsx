import { ItemList } from '@component/ItemList';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useInvestScreen } from '@hook/useInvestScreen';
import { useInvestTarget } from '@hook/useInvestTarget';
import { useSeenTab } from '@hook/useSeenTab';

// Onglet « Investir » : orchestrateur de `useInvestScreen`, `useInvestTarget`
// et `useSeenTab`.
export const InvestPage = () => {
  const invest = useInvestScreen();
  const target = useInvestTarget();
  useSeenTab('invest');

  return (
    <Window title="Investir">
      <ProgressBar
        label={invest.stock.label}
        value={invest.stock.value}
        max={invest.stock.max}
      />
      <Tabs
        value={target.tab}
        onValueChange={target.setTab}
        tabs={[
          {
            id: 'companies',
            label: 'Entreprises',
            content: (
              <ItemList caption="Entreprises" items={invest.companies} />
            ),
          },
          {
            id: 'upgrades',
            label: 'Améliorations',
            content:
              invest.availableUpgrades.length === 0 ? (
                <Note>Plus rien à acheter pour le moment.</Note>
              ) : (
                <ItemList
                  caption="Améliorations"
                  items={invest.availableUpgrades}
                  highlightedId={target.highlightedId}
                />
              ),
          },
          {
            id: 'districts',
            label: 'Quartiers (réputation)',
            content: <ItemList caption="Quartiers" items={invest.districts} />,
          },
          {
            id: 'owned',
            label: 'Obtenues',
            content:
              invest.ownedUpgrades.length === 0 ? (
                <Note>Aucune amélioration obtenue pour le moment.</Note>
              ) : (
                <ItemList caption="Obtenues" items={invest.ownedUpgrades} />
              ),
          },
        ]}
      />
    </Window>
  );
};
