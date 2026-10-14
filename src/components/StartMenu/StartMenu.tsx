import { SidebarLink } from '@component/Sidebar';
import type { SidebarItem } from '@component/Sidebar';
import styles from './StartMenu.module.css';

type StartMenuProperties = {
  label: string;
  // Texte vertical de la bande bleue.
  banner: string;
  items: readonly SidebarItem[];
  // Lien à l'écart, en bas du menu.
  footer: SidebarItem;
  onClose: () => void;
};

// Menu Démarrer : un panneau ancré en bas à gauche, au-dessus de la barre des
// tâches. Il laisse voir le jeu à droite et au-dessus ; toucher à côté le ferme.
export const StartMenu = ({
  label,
  banner,
  items,
  footer,
  onClose,
}: StartMenuProperties) => (
  <>
    <button
      type="button"
      className={styles.backdrop}
      aria-label="Fermer le menu"
      tabIndex={-1}
      onClick={onClose}
    />
    <div className={styles.menu}>
      <p className={styles.banner} aria-hidden="true">
        {banner}
      </p>
      <nav className={styles.nav} aria-label={label}>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id}>
              <SidebarLink item={item} showLabel onClick={onClose} />
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <SidebarLink item={footer} showLabel onClick={onClose} />
        </div>
      </nav>
    </div>
  </>
);
