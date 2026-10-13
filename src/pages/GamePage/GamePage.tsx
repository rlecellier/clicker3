import { Outlet } from 'react-router';
import { GameHeader } from '@component/GameHeader';
import { Sidebar, SidebarIcon } from '@component/Sidebar';
import { useCourseChoiceState } from '@hook/useCourseChoice';
import { useGameHeader } from '@hook/useGameHeader';
import { useGameTabs } from '@hook/useGameTabs';
import { useGameShortcuts } from '@hook/useKeyboardShortcuts';
import styles from './GamePage.module.css';

// Layout de l'écran de jeu : la sidebar et, à droite, la page de l'onglet
// ouvert (routes imbriquées, ADR 0008), sous l'en-tête (argent et jauge de
// temps) visible quel que soit l'onglet.
export const GamePage = () => {
  const { tabs, footer } = useGameTabs();
  const header = useGameHeader();
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
    </div>
  );
};
