import type { ReactNode } from 'react';

export type ResourceIconId = 'money' | 'stock' | 'star' | 'star-empty';

type ResourceIconProperties = { id: ResourceIconId };

// Pictogrammes en aplats 16×16 (`currentColor`), comme ceux de la sidebar.
// Décoratifs (`aria-hidden`) : le libellé est porté par le texte voisin.
const glyphs: Record<ResourceIconId, ReactNode> = {
  // Pièce marquée d'un euro.
  money: (
    <>
      <circle cx="8" cy="8" r="7" />
      <text
        x="8"
        y="12"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="var(--color-surface)"
      >
        €
      </text>
    </>
  ),
  // Caisse : couvercle, planches et poignée.
  stock: (
    <>
      <path d="M1 3h14v3H1z" />
      <path d="M2 7h12v7H2z" />
      <path
        d="M6 9.5h4"
        fill="none"
        stroke="var(--color-surface)"
        strokeWidth="1.5"
      />
    </>
  ),
  star: (
    <path d="M8 1l2.1 4.6 5 .5-3.8 3.4 1.1 4.9L8 11.8 3.6 14.4l1.1-4.9L.9 6.1l5-.5z" />
  ),
  'star-empty': (
    <path
      d="M8 2.2l1.8 4 4.3.4-3.3 2.9.9 4.2L8 11.4l-3.7 2.3.9-4.2L1.9 6.6l4.3-.4z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
  ),
};

export const ResourceIcon = ({ id }: ResourceIconProperties) => (
  <svg
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    {glyphs[id]}
  </svg>
);
