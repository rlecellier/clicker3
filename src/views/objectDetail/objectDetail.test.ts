import { childObjects } from '@game/data';
import { objectDetail, objectUnlocks } from './objectDetail';

describe('objectDetail', () => {
  it('liste les activités qu’un objet débloque et les événements qu’il rend possibles', () => {
    expect(objectUnlocks('teddy')).toEqual([
      {
        caption: 'Débloque',
        items: ['Câliner le nounours', 'Apprendre à marcher au nounours'],
      },
      { caption: 'Peut mener à', items: ['Le nounours perdu'] },
    ]);
  });

  it('donne une fiche à chaque objet, avec une icône et une description', () => {
    for (const { id } of childObjects) {
      const detail = objectDetail(id);
      expect(detail?.icon, id).not.toBe('');
      expect(detail?.description, id).not.toBe('');
      // Chaque objet fait quelque chose : une activité au moins.
      expect(objectUnlocks(id).length, id).toBeGreaterThan(0);
    }
    expect(objectDetail('inconnu')).toBeUndefined();
  });
});
