import { Badge } from '@component/Badge';
import { Button } from '@component/Button';
import { CityMap } from '@component/CityMap';
import { DataTable } from '@component/DataTable';
import { ImpactGauges } from '@component/ImpactGauges';
import { InfoPanel } from '@component/InfoPanel';
import { ItemList } from '@component/ItemList';
import { LedgerSection } from '@component/LedgerSection';
import { LedgerTable } from '@component/LedgerTable';
import { MailPopup } from '@component/MailPopup';
import { Note } from '@component/Note';
import { GameHeader } from '@component/GameHeader';
import { ProgressBar } from '@component/ProgressBar';
import { Sidebar, SidebarIcon } from '@component/Sidebar';
import { Stat } from '@component/Stat';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import styles from './StyleguidePage.module.css';

const columns = [
  { id: 'name', header: 'Entreprise' },
  { id: 'count', header: 'Nombre', isNumeric: true },
  { id: 'cost', header: 'Coût', isNumeric: true },
] as const;

const rows = [
  { id: 'atelier', cells: ['Atelier d’assemblage', 3, '260 €'] },
  { id: 'boutique', cells: ['Boutique', 1, '1 200 €'] },
];

// Page de revue visuelle, réservée au développement (voir routes.tsx).
export const StyleguidePage = () => (
  <main className={styles.page}>
    <Window title="Guide de style" actions={<Badge tone="info">v1</Badge>}>
      <GameHeader
        money="1 250 €"
        date="janvier 1999"
        gauge={{ value: 6, max: 10 }}
      />
      <GameHeader
        money="-1 234 567,89 €"
        date="décembre 2026"
        gauge={{ value: 10, max: 10 }}
      />
      <ProgressBar label="Progression" value={6} max={10} />
      <ProgressBar label="Métier · palier 1" value={6} max={10} size="small" />
      <dl className={styles.stats}>
        <Stat label="Argent" value="1 250 €" />
        <Stat label="Âge" value="23 ans" />
      </dl>
      <div className={styles.row}>
        <Button>Travailler</Button>
        <Button variant="primary">Démarrer ma vie</Button>
        <Button variant="danger">Recommencer</Button>
        <Button isDisabled>Indisponible</Button>
        <Button isPending>En cours</Button>
        <Button size="large">Grand bouton</Button>
      </div>
      <div className={styles.row}>
        <Badge>Neutre</Badge>
        <Badge tone="info">Information</Badge>
        <Badge tone="alert">Alerte</Badge>
        <InfoPanel content="Votre employeur le sait et en prend note.">
          <button type="button" className={styles.link}>
            Survolez-moi
          </button>
        </InfoPanel>
      </div>
      <DataTable caption="Vos entreprises" columns={columns} rows={rows} />
      <CityMap
        title="Plan de Sainte-Croissance"
        slogan="Sainte-Croissance, ville en mouvement."
        onSelect={() => {}}
        districts={[
          {
            id: 'tilleuls',
            name: 'Les Tilleuls',
            isLocked: false,
            isSelected: true,
            conditions: [],
            buildings: [
              { id: 'atelier', label: 'Atelier', kind: 'production', count: 2 },
            ],
          },
          {
            id: 'hauts-fourneaux',
            name: 'Les Hauts-Fourneaux',
            isLocked: true,
            isSelected: false,
            conditions: ['Palier de réputation 1 requis'],
            buildings: [],
          },
        ]}
      />
      <ImpactGauges
        caption="Indicateurs"
        gauges={[
          {
            id: 'pollution',
            label: 'Pollution (dynamisme industriel)',
            value: 35,
          },
          {
            id: 'inequality',
            label: 'Inégalités (convergence en cours)',
            value: 60,
          },
        ]}
      />
      <ItemList
        caption="Améliorations"
        items={[
          {
            id: 'camionnette',
            title: 'Camionnette d’occasion',
            effects: [
              'Production de Atelier d’assemblage +15 %',
              'Production : 40 → 46 articles par période',
            ],
            detail: 'Elle démarre le lundi. 16 000 €',
            actionLabel: 'Acheter',
            isDisabled: false,
            onAction: () => {},
          },
        ]}
      />
      <Note>Bienvenue dans l’euro. Votre compte est crédité de 0 €.</Note>
      <MailPopup
        date="3 mars 2026"
        text="Votre loyer augmente de 20 € par mois."
        otherCount={2}
        mailPath="/jeu/courrier"
        onDismiss={() => {}}
        onPause={() => {}}
        onResume={() => {}}
      />
      <LedgerSection
        title="D’où vient l’argent ?"
        help="Les commerces vendent tout le stock, production de la période comprise."
      >
        <LedgerTable
          caption="Recettes"
          rows={[
            {
              id: 'sales',
              label: 'Ventes des commerces',
              amount: '180 €',
              share: '90 %',
            },
            {
              id: 'sales-boutique',
              label: '· Boutique',
              amount: '180 €',
              share: '90 %',
            },
            {
              id: 'surplus',
              label: 'Vente du surplus',
              amount: '20 €',
              share: '10 %',
            },
          ]}
        />
      </LedgerSection>
      <Tabs
        tabs={[
          { id: 'work', label: 'Travail', content: 'Contenu du travail.' },
          { id: 'shop', label: 'Achats', content: 'Contenu des achats.' },
        ]}
      />
      <div className={styles.sidebarDemo}>
        <Sidebar
          label="Navigation de démonstration"
          items={[
            {
              id: 'mail',
              label: 'Courrier',
              icon: <SidebarIcon id="mail" />,
              to: '#',
              badge: 3,
              badgeTone: 'alert',
              accessibleLabel: 'Courrier, 3 messages non lus',
              shortcut: '1',
            },
            {
              id: 'life',
              label: 'Vie',
              icon: <SidebarIcon id="life" />,
              to: '#',
            },
            {
              id: 'invest',
              label: 'Investir',
              icon: <SidebarIcon id="invest" />,
              to: '#',
              badge: 1,
              badgeTone: 'info',
              accessibleLabel: 'Investir, 1 nouveauté',
            },
            {
              id: 'jobs',
              label: 'Emploi',
              icon: <SidebarIcon id="jobs" />,
              to: '#',
              badge: '99+',
              badgeTone: 'alert',
            },
          ]}
          footer={{
            id: 'new-life',
            label: 'Recommencer',
            icon: <SidebarIcon id="new-life" />,
            to: '#',
          }}
        />
      </div>
    </Window>
  </main>
);
