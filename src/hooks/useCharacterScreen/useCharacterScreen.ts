import { useGameContext } from '@context/GameContext';
import { childAxes, childRules } from '@game/data';
import { axisReading } from '@game/earlyChildhood';
import { traitItems } from '@view/childCharacter';

// Les paliers qui débloquent, en distance à 0 : ±25, ±50, ±75.
const axisMarks = Array.from(
  { length: Math.floor(childRules.axisLimit / childRules.axisThreshold) },
  (_, index) => (index + 1) * childRules.axisThreshold,
);

// Onglet « Caractère » de la petite enfance : les quatre axes et les traits.
export const useCharacterScreen = () => {
  const { state } = useGameContext();
  return {
    axes: childAxes.map((axis) => {
      const value = state.child.axes[axis.id];
      const { pole } = axisReading(axis, value);
      return {
        id: axis.id,
        name: axis.name,
        label: `${axis.name} : ${pole}`,
        negativePole: axis.negative,
        positivePole: axis.positive,
        value,
        max: childRules.axisLimit,
        marks: axisMarks,
      };
    }),
    traits: traitItems(state.child.traits),
  };
};
