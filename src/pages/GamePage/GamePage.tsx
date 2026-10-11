import { Outlet } from 'react-router';
import { EventToast } from '@component/EventToast';
import { Sidebar, SidebarIcon } from '@component/Sidebar';
import { useGameTabs } from '@hook/useGameTabs';
import { useJournalScreen } from '@hook/useJournalScreen';
import styles from './GamePage.module.css';

// Layout de l'écran de jeu : la sidebar et, à droite, la page de l'onglet
// ouvert (routes imbriquées, ADR 0008). La popup de courrier reste visible
// quel que soit l'onglet.
export const GamePage = () => {
  const { tabs, footer } = useGameTabs();
  const journal = useJournalScreen();

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
      <main className={styles.content}>
        <div className={styles.page}>
          {journal.toast === null ? null : (
            <EventToast
              date={journal.toast.date}
              text={journal.toast.text}
              onDismiss={journal.toast.dismiss}
            />
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
};
