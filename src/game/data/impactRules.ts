// Quartier où se pose chaque type d'entreprise (les Tilleuls si fermé), par id
// d'entreprise.
const companyDistricts: Readonly<Record<string, string>> = {
  etabli: 'tilleuls',
  stand: 'tilleuls',
  atelier: 'tilleuls',
  boutique: 'tilleuls',
  manufacture: 'hauts-fourneaux',
  hypermarche: 'parc-horizon',
  'site-delocalise': 'parc-horizon',
  plateforme: 'pole-excellence',
};

// Richesse moyenne des habitants de chaque quartier (euros), par id de quartier.
const residentWealth: Readonly<Record<string, number>> = {
  tilleuls: 200_000,
  'hauts-fourneaux': 150_000,
  'parc-horizon': 400_000,
  'pole-excellence': 1_200_000,
};

// Valeurs des indicateurs d'impact (ADR 0004), rééchelonnées avec les entreprises à l'échelle réelle (issue #167).
export const impactRules = {
  // Quartier de résidence : l'argent du personnage y compte.
  homeDistrict: 'tilleuls',
  companyDistricts,
  pollution: {
    // Charge qui donne 50 de pollution.
    half: 20_000,
    // Poids de la production et du commerce (transport) dans la charge.
    weights: { production: 1, commerce: 0.25 },
  },
  inequality: {
    residentWealth,
  },
} as const;
