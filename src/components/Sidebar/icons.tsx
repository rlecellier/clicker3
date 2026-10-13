import type { ReactNode } from 'react';

// Pictogrammes en aplats 16×16, dans l'esprit d'un logiciel de 1999 : une
// couleur (`currentColor`), pas de dégradé. Décoratifs (`aria-hidden`).
export type SidebarIconId =
  | 'mail'
  | 'life'
  | 'skills'
  | 'jobs'
  | 'companies'
  | 'upgrades'
  | 'accounts'
  | 'city'
  | 'new-life';

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
  // Personnage : tête et buste.
  life: (
    <>
      <circle cx="8" cy="4.5" r="3" />
      <path d="M2 15c0-4 2.5-6 6-6s6 2 6 6z" />
    </>
  ),
  // Histogramme.
  skills: <path d="M1 9h3v6H1zM6 5h3v10H6zM11 1h3v14h-3z" />,
  // Mallette.
  jobs: (
    <>
      <path d="M5 2h6v3H9.5V3.5h-3V5H5z" />
      <path d="M1 5h14v9H1z" />
    </>
  ),
  // Immeuble : façade et fenêtres.
  companies: (
    <>
      <path d="M2 15V3h8v12z" />
      <path d="M10 15V7h4v8z" />
      <path
        d="M4 5.5h4M4 8.5h4M4 11.5h4"
        stroke="var(--color-surface)"
        strokeWidth="1.2"
      />
    </>
  ),
  // Flèche vers le haut.
  upgrades: <path d="M8 1l6 7H10v7H6V8H2z" />,
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
  // Immeubles.
  city: <path d="M1 7h5v8H1zM7 2h5v13H7zM13 9h2v6h-2z" />,
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
