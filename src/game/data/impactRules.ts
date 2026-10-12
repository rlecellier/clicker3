// Quartier où se pose chaque type d'entreprise (les Tilleuls si fermé), par id
// d'entreprise.
const companyDistricts: Readonly<Record<string, string>> = {
  atelier: 'tilleuls',
  boutique: 'tilleuls',
  manufacture: 'hauts-fourneaux',
  hypermarche: 'parc-horizon',
  'site-delocalise': 'parc-horizon',
  plateforme: 'pole-excellence',
};

// Richesse moyenne des habitants de chaque quartier (euros), par id de quartier.
const residentWealth: Readonly<Record<string, number>> = {
  tilleuls: 2000,
  'hauts-fourneaux': 1500,
  'parc-horizon': 4000,
  'pole-excellence': 12_000,
};

// Valeurs des indicateurs d'impact (ADR 0004), non modifiées par l'équilibrage V1-24.
export const impactRules = {
  // Quartier de résidence : l'argent du personnage y compte.
  homeDistrict: 'tilleuls',
  companyDistricts,
  pollution: {
    // Charge qui donne 50 de pollution.
    half: 100,
    // Poids de la production et du commerce (transport) dans la charge.
    weights: { production: 1, commerce: 0.25 },
  },
  inequality: {
    residentWealth,
  },
} as const;
