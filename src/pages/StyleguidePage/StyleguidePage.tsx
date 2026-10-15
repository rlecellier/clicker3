import { ActionButton } from '@component/ActionButton';
import { Badge } from '@component/Badge';
import { Button } from '@component/Button';
import { CharacterHeader } from '@component/CharacterHeader';
import { CityMap } from '@component/CityMap';
import { ConfirmPrompt } from '@component/ConfirmPrompt';
import { DataTable } from '@component/DataTable';
import { DistrictSheet } from '@component/DistrictSheet';
import { EventLog } from '@component/EventLog';
import { FigureList } from '@component/FigureList';
import { ImpactGauges } from '@component/ImpactGauges';
import { InfoPanel } from '@component/InfoPanel';
import { ItemList } from '@component/ItemList';
import { LedgerSection } from '@component/LedgerSection';
import { LedgerTable } from '@component/LedgerTable';
import { MarkerTrack } from '@component/MarkerTrack';
import { SleepSummary } from '@component/SleepSummary';
import { Note } from '@component/Note';
import { GameHeader } from '@component/GameHeader';
import { PageLink } from '@component/PageLink';
import { PolarGauge } from '@component/PolarGauge';
import { ProgressBar } from '@component/ProgressBar';
import { ReputationStars } from '@component/ReputationStars';
import { Sidebar, SidebarIcon } from '@component/Sidebar';
import { SplitActionButton } from '@component/SplitActionButton';
import { ResourceTile } from '@component/ResourceTile';
import { Stat } from '@component/Stat';
import { Tabs } from '@component/Tabs';
import { Title } from '@component/Title';
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
    <Window
      title="Guide de style"
      actions={
        <>
          <ReputationStars
            tier={2}
            max={3}
            label="Réputation : palier 2 sur 3"
          />
          <Badge tone="info">v1</Badge>
        </>
      }
    >
      <GameHeader
        resources={{
          money: { value: '1,2k €', exact: '1 250 €' },
          stock: { value: '12 / 50', exact: '12 / 50' },
        }}
        date="janvier 1999"
        activity="Au travail"
        gauge={{
          value: 6,
          max: 10,
          segments: [
            { tone: 'study', value: 2 },
            { tone: 'work', value: 3 },
          ],
        }}
      />
      <GameHeader
        resources={{
          money: { value: '-1,2M €', exact: '-1 234 567 €' },
          stock: { value: '50k / 50k', exact: '50 000 / 50 000' },
        }}
        date="décembre 2026"
        activity="Au travail"
        gauge={{ value: 10, max: 10, segments: [{ tone: 'work', value: 10 }] }}
      />
      <dl className={styles.stats}>
        <ResourceTile icon="money" label="Argent" balance="+120 €" to="#" />
        <ResourceTile icon="stock" label="Stock" balance="−45" to="#" />
      </dl>
      <Title>Titre de page</Title>
      <CharacterHeader
        name="Camille Martin"
        age="23 ans"
        date="janvier 1999"
        phase="Jeune actif"
      />
      <MarkerTrack count={3} max={5} />
      <MarkerTrack count={5} max={5} />
      <SleepSummary
        title="Sommeil : 8 h par jour (éveil : 16 h)"
        lines={[
          'Base de 8 h pour votre âge.',
          'Dernière nuit : 3 marqueurs convertis.',
        ]}
      />
      <ActionButton
        label="Travailler"
        detail="+12 € par clic"
        isAuto
        autoHint="Appui long : couper l’automatique"
        shortcut="T"
        onClick={() => {}}
      />
      <ActionButton
        label="Acheter"
        detail="1 200 €"
        reason="Argent insuffisant"
        isDisabled
        onClick={() => {}}
      />
      <SplitActionButton
        label="Étudier"
        detail="Gestion"
        menuLabel="Choisir le cursus"
        choices={[
          { id: 'gestion', label: 'Gestion', detail: 'Palier 1' },
          { id: 'commerce', label: 'Commerce', detail: 'Palier 2' },
        ]}
        selectedId="gestion"
        onSelect={() => {}}
        shortcut="E"
        onClick={() => {}}
      />
      <EventLog
        entries={[
          {
            id: 'loyer',
            date: 'mars 2026',
            text: 'Votre loyer augmente de 20 € par mois.',
            isNew: true,
          },
          {
            id: 'accueil',
            date: 'janvier 2026',
            text: 'Bienvenue dans l’euro.',
            isNew: false,
          },
        ]}
        emptyText="Aucun courrier."
      />
      <DistrictSheet
        name="Les Tilleuls"
        description="Un quartier calme, bien desservi."
        detail="Ouvert"
        badge="Ouvert"
        actionLabel="Ouvrir"
        isDisabled
        reason="Déjà ouvert"
        onAction={() => {}}
        gauges={[{ id: 'pollution', label: 'Pollution', value: 35 }]}
      />
      <FigureList
        figures={[
          { label: 'Argent final', value: '1 250 €' },
          { label: 'Âge', value: '64 ans' },
        ]}
      />
      <PageLink to="#">Retour au titre</PageLink>
      <ConfirmPrompt
        message="Recommencer efface la partie en cours."
        confirmLabel="Recommencer"
        cancelLabel="Annuler"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
      <ProgressBar label="Progression" value={6} max={10} />
      <ProgressBar label="Métier · palier 1" value={6} max={10} size="small" />
      <PolarGauge
        name="Énergie"
        label="Énergie : Vif"
        negativePole="Posé"
        positivePole="Vif"
        value={34}
        max={100}
        marks={[25, 50, 75]}
      />
      <PolarGauge
        name="Tempérament"
        label="Tempérament : Neutre"
        negativePole="Raison"
        positivePole="Sentiment"
        value={0}
        max={100}
        marks={[25, 50, 75]}
      />
      <dl className={styles.stats}>
        <Stat label="Argent" value="1,2k €" balance="+120 €" />
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
              id: 'companies',
              label: 'Entreprises',
              icon: <SidebarIcon id="companies" />,
              to: '#',
              badge: 1,
              badgeTone: 'info',
              accessibleLabel: 'Entreprises, 1 nouveauté',
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
