import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode } from 'react';
import styles from './Tabs.module.css';

export type TabItem = { id: string; label: string; content: ReactNode };

type TabsProperties = {
  tabs: readonly TabItem[];
  // Onglet ouvert au départ (le premier par défaut).
  defaultTab?: string;
  // Mode contrôlé : l'appelant porte l'onglet ouvert.
  value?: string;
  onValueChange?: (id: string) => void;
};

export const Tabs = ({
  tabs,
  defaultTab,
  value,
  onValueChange,
}: TabsProperties) => (
  <BaseTabs.Root
    {...(value === undefined
      ? { defaultValue: defaultTab ?? tabs[0]?.id }
      : { value })}
    onValueChange={(next) => {
      onValueChange?.(String(next));
    }}
    className={styles.root}
  >
    <BaseTabs.List className={styles.list}>
      {tabs.map((tab) => (
        <BaseTabs.Tab key={tab.id} value={tab.id} className={styles.tab}>
          {tab.label}
        </BaseTabs.Tab>
      ))}
    </BaseTabs.List>
    {tabs.map((tab) => (
      <BaseTabs.Panel key={tab.id} value={tab.id} className={styles.panel}>
        {tab.content}
      </BaseTabs.Panel>
    ))}
  </BaseTabs.Root>
);
