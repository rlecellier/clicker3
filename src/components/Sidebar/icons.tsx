import type { ReactNode } from 'react';

// Pictogrammes en aplats 16×16, dans l'esprit d'un logiciel de 1999 : une
// couleur (`currentColor`), pas de dégradé. Décoratifs (`aria-hidden`).
export type SidebarIconId =
  | 'mail'
  | 'life'
  | 'profile'
  | 'jobs'
  | 'companies'
  | 'upgrades'
  | 'accounts'
  | 'finance'
  | 'city'
  | 'character'
  | 'house'
  | 'relations'
  | 'new-life'
  | 'start';

type SidebarIconProperties = { id: SidebarIconId };

const glyphs: Record<SidebarIconId, ReactNode> = {
  // Enveloppe.
  mail: (
    <>
      <path d="M1 3h14v10H1z" />
      <path
        d="M1 3l7 6 7-6"
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="1.5"
      />
    </>
  ),
  // Maison : l'écran principal, là où l'on vit.
  life: (
    <>
      <path d="M8 1l7 7h-2v7H3V8H1z" />
      <path d="M6.5 15v-4h3v4z" fill="var(--color-surface)" />
    </>
  ),
  // Personnage : tête et buste.
  profile: (
    <>
      <circle cx="8" cy="4.5" r="3" />
      <path d="M2 15c0-4 2.5-6 6-6s6 2 6 6z" />
    </>
  ),
  // Mallette.
  jobs: (
    <>
      <path d="M5 2h6v3H9.5V3.5h-3V5H5z" />
      <path d="M1 5h14v9H1z" />
    </>
  ),
  // Usine : toit en dents de scie, cheminée et fenêtres.
  companies: (
    <>
      <path d="M1 15V7l4 3V7l4 3V7l4 3V2h2v13z" />
      <path
        d="M3 12h2v2H3zM7 12h2v2H7zM11 12h2v2h-2z"
        fill="var(--color-surface)"
      />
    </>
  ),
  // Flèche vers le haut, posée sur une base.
  upgrades: <path d="M8 1l6 6h-4v5H6V7H2zM3 13.5h10V15H3z" />,
  // Registre : page à lignes.
  accounts: (
    <>
      <path d="M3 1h10v14H3z" />
      <path
        d="M5 5h6M5 8h6M5 11h4"
        stroke="var(--color-surface)"
        strokeWidth="1.2"
      />
    </>
  ),
  // Pièce de monnaie.
  finance: (
    <>
      <circle cx="8" cy="8" r="7" />
      <path
        d="M8 4v8M10.5 6C10 5 6 5 6 7s4 1 4 3-4 2-4.5 1"
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="1.3"
      />
    </>
  ),
  // Repère de carte : le plan de la ville.
  // Visage : le caractère.
  character: (
    <>
      <circle cx="8" cy="8" r="7" />
      <circle cx="5.5" cy="6.5" r="1.1" fill="var(--color-surface)" />
      <circle cx="10.5" cy="6.5" r="1.1" fill="var(--color-surface)" />
      <path
        d="M4.5 10c1 1.8 5 1.8 7 0"
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="1.3"
      />
    </>
  ),
  // Coffre à jouets.
  house: (
    <>
      <path d="M2 6h12v8H2z" />
      <path d="M1 3h14v3H1z" />
      <path d="M6.5 8h3v2h-3z" fill="var(--color-surface)" />
    </>
  ),
  // Deux personnages côte à côte.
  relations: (
    <>
      <circle cx="5" cy="5" r="2.5" />
      <path d="M0 14c0-3.5 2-5 5-5s5 1.5 5 5z" />
      <circle cx="11.5" cy="5.5" r="2" />
      <path d="M9 14c0-2.5 1.5-4 4-4s3 1.5 3 4z" />
    </>
  ),
  city: (
    <>
      <path d="M8 1a5 5 0 0 0-5 5c0 4 5 9 5 9s5-5 5-9a5 5 0 0 0-5-5z" />
      <circle cx="8" cy="6" r="2" fill="var(--color-surface)" />
    </>
  ),
  // Quatre vitres : le bouton Démarrer.
  start: <path d="M1 2l6-1v6H1zM8 1l7-1v7H8zM1 9h6v6l-6-1zM8 9h7v7l-7-1z" />,
  // Flèche de retour.
  'new-life': (
    <path d="M8 2a6 6 0 1 1-6 6h2.5A3.5 3.5 0 1 0 8 4.5V7L3.5 3.5 8 0z" />
  ),
};

export const SidebarIcon = ({ id }: SidebarIconProperties) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    {glyphs[id]}
  </svg>
);
