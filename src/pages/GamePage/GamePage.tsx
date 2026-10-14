import { Outlet } from 'react-router';
import { BirthdayPrompt } from '@component/BirthdayPrompt';
import { ChoicePrompt } from '@component/ChoicePrompt';
import { GameHeader } from '@component/GameHeader';
import { PromotionPrompt } from '@component/PromotionPrompt';
import { Sidebar, SidebarIcon } from '@component/Sidebar';
import { StartMenu } from '@component/StartMenu';
import { Taskbar } from '@component/Taskbar';
import { useBirthdayPrompt } from '@hook/useBirthdayPrompt';
import { useChildEventPrompt } from '@hook/useChildEventPrompt';
import { useCourseChoiceState } from '@hook/useCourseChoice';
import { useFinalUpgradePrompt } from '@hook/useFinalUpgradePrompt';
import { useGameHeader } from '@hook/useGameHeader';
import { useGameNavigation } from '@hook/useGameNavigation';
import { usePromotionPrompt } from '@hook/usePromotionPrompt';
import { useLifeSlice } from '@hook/useLifeSlice';
import { useGameShortcuts } from '@hook/useKeyboardShortcuts';
import type { GameTabId } from '@hook/useGameTabs';
import styles from './GamePage.module.css';

const navigationLabel = 'Navigation du jeu';

const withIcon = <Item extends { id: GameTabId }>(item: Item) => ({
  ...item,
  icon: <SidebarIcon id={item.id} />,
});

// Layout de l'écran de jeu : la navigation et la page de l'onglet ouvert
// (routes imbriquées, ADR 0008), sous l'en-tête (argent et jauge de temps)
// visible quel que soit l'onglet. Au-dessus de 40 rem, la sidebar est à
// gauche ; en dessous, une barre des tâches en bas ouvre le menu Démarrer. Un
// anniversaire ou une promotion proposée s'affiche par-dessus et arrête le jeu.
export const GamePage = () => {
  const navigation = useGameNavigation();
  const header = useGameHeader();
  const { hasGrowth } = useLifeSlice();
  const promotion = usePromotionPrompt();
  const birthday = useBirthdayPrompt();
  const finale = useFinalUpgradePrompt();
  const childEvent = useChildEventPrompt();
  // Fenêtres à un bouton : un anniversaire passe avant la dernière amélioration.
  const notice = birthday ?? finale;
  const courseChoice = useCourseChoiceState();
  useGameShortcuts(courseChoice.chosenCourse);

  const footer = { ...navigation.footer, icon: <SidebarIcon id="new-life" /> };

  return (
    <div
      className={navigation.isCompact ? styles.layoutCompact : styles.layout}
    >
      {navigation.isCompact ? null : (
        <Sidebar
          label={navigationLabel}
          items={navigation.tabs.map((tab) => withIcon(tab))}
          footer={footer}
        />
      )}
      <div className={styles.main}>
        {hasGrowth ? null : <GameHeader {...header} />}
        <main className={styles.content}>
          <div className={styles.page}>
            <Outlet context={courseChoice} />
          </div>
        </main>
      </div>
      {navigation.isCompact ? (
        <Taskbar
          label={navigationLabel}
          items={navigation.pinned.map((tab) => withIcon(tab))}
          start={navigation.start}
          menu={
            navigation.start.isOpen ? (
              <StartMenu
                label="Menu Démarrer"
                banner="Sainte-Croissance"
                items={navigation.tabs.map((tab) => withIcon(tab))}
                footer={footer}
                onClose={navigation.closeMenu}
              />
            ) : null
          }
        />
      ) : null}
      {childEvent === null ? null : <ChoicePrompt {...childEvent} />}
      {notice ? (
        <BirthdayPrompt {...notice} />
      ) : (
        promotion && <PromotionPrompt {...promotion} />
      )}
    </div>
  );
};
