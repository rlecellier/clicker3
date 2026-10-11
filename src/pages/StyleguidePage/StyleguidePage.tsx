import { Badge } from '@component/Badge';
import { Button } from '@component/Button';
import { DataTable } from '@component/DataTable';
import { InfoPanel } from '@component/InfoPanel';
import { Note } from '@component/Note';
import { ProgressBar } from '@component/ProgressBar';
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
      <ProgressBar label="Jauge de temps" value={6} max={10} />
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
      <Note>Bienvenue dans l’euro. Votre compte est crédité de 0 €.</Note>
      <Tabs
        tabs={[
          { id: 'work', label: 'Travail', content: 'Contenu du travail.' },
          { id: 'shop', label: 'Achats', content: 'Contenu des achats.' },
        ]}
      />
    </Window>
  </main>
);
