import { ActionButton } from '@component/ActionButton';
import { CharacterHeader } from '@component/CharacterHeader';
import { Button } from '@component/Button';
import { ConfirmPrompt } from '@component/ConfirmPrompt';
import { EventLog } from '@component/EventLog';
import { EventToast } from '@component/EventToast';
import { ItemList } from '@component/ItemList';
import { LedgerTable } from '@component/LedgerTable';
import { MarkerTrack } from '@component/MarkerTrack';
import { Note } from '@component/Note';
import { PageLink } from '@component/PageLink';
import { ProgressBar } from '@component/ProgressBar';
import { SplitActionButton } from '@component/SplitActionButton';
import { Stat } from '@component/Stat';
import { Tabs } from '@component/Tabs';
import { Window } from '@component/Window';
import { useGameScreen } from '@hook/useGameScreen';
import { useInvestScreen } from '@hook/useInvestScreen';
import { useJournalScreen } from '@hook/useJournalScreen';
import { useResetGame } from '@hook/useResetGame';
import styles from './GamePage.module.css';

// Orchestrateur : branche `useGameScreen` sur les composants visuels.
export const GamePage = () => {
  const screen = useGameScreen();
  const invest = useInvestScreen();
  const journal = useJournalScreen();
  const reset = useResetGame();
  const { work, sellSurplus } = screen.actions;
  const { study } = screen;

  return (
    <main className={styles.page}>
      {journal.toast === null ? null : (
        <EventToast
          date={journal.toast.date}
          text={journal.toast.text}
          onDismiss={journal.toast.dismiss}
        />
      )}
      <Window title="Ma vie à Sainte-Croissance">
        <CharacterHeader {...screen.header} />
        {screen.intro === null ? null : <Note>{screen.intro}</Note>}
        <ProgressBar
          label="Jauge de temps"
          value={screen.gauge.value}
          max={screen.gauge.max}
        />
        <dl className={styles.counters}>
          <Stat label="Argent" value={screen.counters.money} />
          <Stat label="Stock" value={screen.counters.stock} />
          <Stat label="Réputation" value={screen.counters.reputation} />
          <Stat
            label="Palier de réputation"
            value={screen.counters.reputationTier}
          />
        </dl>
        <Note>{screen.objective}</Note>
        <div className={styles.actions}>
          <ActionButton
            label="Travailler"
            detail={work.detail}
            reason={work.reason}
            isDisabled={work.isDisabled}
            variant="primary"
            isAuto={work.isAuto}
            autoHint={work.autoHint}
            press={work.press}
            onClick={work.run}
          />
          {study.action === null ? null : (
            <SplitActionButton
              label="Étudier"
              detail={study.action.detail}
              reason={study.action.reason}
              isDisabled={study.action.isDisabled}
              menuLabel="Choisir le cursus"
              choices={study.choices}
              selectedId={study.selectedId}
              onSelect={study.select}
              onClick={study.action.run}
            />
          )}
          <ActionButton
            label="Vendre le surplus"
            detail={sellSurplus.detail}
            reason={sellSurplus.reason}
            isDisabled={sellSurplus.isDisabled}
            onClick={sellSurplus.run}
          />
        </div>
        <p className={styles.feedback} role="status">
          {screen.feedback}
        </p>
        <MarkerTrack {...screen.brain} />
        <ProgressBar
          label={screen.brain.isSleeping ? 'Sommeil' : 'Éveillé'}
          value={screen.brain.sleepProgress}
          max={screen.brain.max}
        />
      </Window>
      <Window title="Compétences et stats">
        {screen.stats.map((stat) => (
          <ProgressBar
            key={stat.id}
            label={stat.label}
            value={stat.value}
            max={stat.max}
          />
        ))}
      </Window>
      <Window title="Emploi">
        <ItemList caption="Postes" items={screen.jobs} />
      </Window>
      <Window title="Investir">
        <ProgressBar
          label={invest.stock.label}
          value={invest.stock.value}
          max={invest.stock.max}
        />
        <Tabs
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
                invest.nextUpgrades.length === 0 ? (
                  <Note>Plus rien à acheter pour le moment.</Note>
                ) : (
                  <ItemList
                    caption="Prochaine amélioration"
                    items={invest.nextUpgrades}
                  />
                ),
            },
            {
              id: 'districts',
              label: 'Quartiers (réputation)',
              content: (
                <ItemList caption="Quartiers" items={invest.districts} />
              ),
            },
          ]}
        />
      </Window>
      <Window title="Courrier et comptabilité">
        <Tabs
          tabs={[
            {
              id: 'mail',
              label: 'Courrier',
              content: (
                <EventLog
                  entries={journal.entries}
                  emptyText="Aucun courrier. La boîte aux lettres vous remercie de votre patience."
                />
              ),
            },
            {
              id: 'ledger',
              label: 'Comptabilité',
              content: (
                <LedgerTable
                  caption={journal.ledger.caption}
                  rows={journal.ledger.rows}
                />
              ),
            },
          ]}
        />
      </Window>
      <Window title="Ville">
        <PageLink to="/ville">Plan de Sainte-Croissance</PageLink>
      </Window>
      {invest.ownedUpgrades.length === 0 ? null : (
        <Window title="Améliorations obtenues">
          <ItemList caption="Obtenues" items={invest.ownedUpgrades} />
        </Window>
      )}
      <Window title="Partie">
        {reset.isConfirming ? (
          <ConfirmPrompt
            message="Recommencer la partie ? La vie en cours sera archivée sans bilan."
            confirmLabel="Recommencer"
            cancelLabel="Annuler"
            onConfirm={reset.confirm}
            onCancel={reset.cancel}
          />
        ) : (
          <Button variant="danger" onClick={reset.ask}>
            Recommencer la partie
          </Button>
        )}
      </Window>
    </main>
  );
};
