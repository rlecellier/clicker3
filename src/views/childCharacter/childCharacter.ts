import type { FigureItem } from '@component/FigureList';
import type { InfoListItem } from '@component/ItemList';
import { childAxes, childTraits, findById } from '@game/data';
import { axisReading } from '@game/earlyChildhood';
import type { ChildAxisId } from '@game/state';

// Le caractère de l'enfant, en chiffres lisibles : « Énergie : Vif (34) ».
export const axisFigures = (
  axes: Readonly<Record<ChildAxisId, number>>,
): FigureItem[] =>
  childAxes.map((axis) => {
    const { pole, amount } = axisReading(axis, axes[axis.id]);
    return {
      label: axis.name,
      value: pole === 'Neutre' ? pole : `${pole} (${amount})`,
    };
  });

// Les traits, avec leur avantage et leur inconvénient.
export const traitItems = (ids: readonly string[]): InfoListItem[] =>
  ids
    .map((id) => findById(childTraits, id))
    .filter((trait) => trait !== undefined)
    .map((trait) => ({
      id: trait.id,
      title: trait.name,
      detail: `${trait.advantage}. En contrepartie : ${trait.drawback.toLowerCase()}.`,
    }));
