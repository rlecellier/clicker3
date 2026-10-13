import { Outlet } from 'react-router';
import { BirthdayPrompt } from '@component/BirthdayPrompt';
import { GameHeader } from '@component/GameHeader';
import { PromotionPrompt } from '@component/PromotionPrompt';
import { Sidebar, SidebarIcon } from '@component/Sidebar';
import { useBirthdayPrompt } from '@hook/useBirthdayPrompt';
import { useCourseChoiceState } from '@hook/useCourseChoice';
import { useFinalUpgradePrompt } from '@hook/useFinalUpgradePrompt';
import { useGameHeader } from '@hook/useGameHeader';
import { useGameTabs } from '@hook/useGameTabs';
import { usePromotionPrompt } from '@hook/usePromotionPrompt';
import { useGameShortcuts } from '@hook/useKeyboardShortcuts';
import styles from './GamePage.module.css';

// Layout de l'écran de jeu : la sidebar et, à droite, la page de l'onglet
// ouvert (routes imbriquées, ADR 0008), sous l'en-tête (argent et jauge de
// temps) visible quel que soit l'onglet. Un anniversaire ou une promotion proposée s'affiche par-dessus et arrête le jeu.
export const GamePage = () => {
  const { tabs, footer } = useGameTabs();
  const header = useGameHeader();
  const promotion = usePromotionPrompt();
  const birthday = useBirthdayPrompt();
  const finale = useFinalUpgradePrompt();
  // Fenêtres à un bouton : un anniversaire passe avant la dernière amélioration.
  const notice = birthday ?? finale;
  const courseChoice = useCourseChoiceState();
  useGameShortcuts(courseChoice.chosenCourse);

  return (
    <div className={styles.layout}>
      <Sidebar
        label="Navigation du jeu"
        items={tabs.map((tab) => ({
          ...tab,
          icon: <SidebarIcon id={tab.id} />,
        }))}
        footer={{ ...footer, icon: <SidebarIcon id="new-life" /> }}
      />
      <div className={styles.main}>
        <GameHeader {...header} />
        <main className={styles.content}>
          <div className={styles.page}>
            <Outlet context={courseChoice} />
          </div>
        </main>
      </div>
      {notice ? (
        <BirthdayPrompt {...notice} />
      ) : (
        promotion && <PromotionPrompt {...promotion} />
      )}
    </div>
  );
};
