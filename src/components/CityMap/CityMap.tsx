import type { KeyboardEvent } from 'react';
import styles from './CityMap.module.css';

export type MapBuilding = {
  id: string;
  label: string;
  kind: 'production' | 'commerce';
  // Exemplaires possédés.
  count: number;
};

export type MapDistrict = {
  id: string;
  name: string;
  isLocked: boolean;
  isSelected: boolean;
  // Condition de déblocage, affichée sur un quartier verrouillé.
  conditions: readonly string[];
  buildings: readonly MapBuilding[];
};

type CityMapProperties = {
  title: string;
  slogan: string;
  districts: readonly MapDistrict[];
  onSelect: (id: string) => void;
};

const width = 480;
const columns = 2;
const cell = { width: 228, height: 160, gap: 8, top: 30 };
const slot = { width: 68, height: 54, perRow: 3 };

const origin = (index: number) => ({
  x: cell.gap + (index % columns) * (cell.width + cell.gap),
  y: cell.top + Math.floor(index / columns) * (cell.height + cell.gap),
});

const isActivation = (event: KeyboardEvent) =>
  event.key === 'Enter' || event.key === ' ';

const Building = ({
  building,
  x,
  y,
}: {
  building: MapBuilding;
  x: number;
  y: number;
}) => (
  <g transform={`translate(${x} ${y})`}>
    <title>
      {building.label} ({building.count})
    </title>
    <use
      href={`#city-${building.kind}`}
      width={36}
      height={27}
      x={(slot.width - 36) / 2}
    />
    {building.count > 1 ? (
      <text
        className={styles.buildingLabel}
        x={slot.width / 2}
        y={42}
        textAnchor="middle"
      >
        ×{building.count}
      </text>
    ) : null}
  </g>
);

// Plan d'urbanisme schématique : quartiers en aplats, légende et échelle.
export const CityMap = ({
  title,
  slogan,
  districts,
  onSelect,
}: CityMapProperties) => {
  const rows = Math.ceil(districts.length / columns);
  const mapBottom = cell.top + rows * (cell.height + cell.gap);
  const height = mapBottom + 52;
  return (
    <svg
      className={styles.map}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label={title}
    >
      <defs>
        <symbol id="city-production" viewBox="0 0 32 24">
          <rect className={styles.wall} x="2" y="8" width="28" height="15" />
          <path className={styles.wall} d="M2 8 L10 3 V8 L18 3 V8 L26 3 V8" />
          <rect className={styles.chimney} x="24" y="0" width="4" height="9" />
        </symbol>
        <symbol id="city-commerce" viewBox="0 0 32 24">
          <rect className={styles.wall} x="3" y="9" width="26" height="14" />
          <path className={styles.awning} d="M1 9 L4 2 H28 L31 9 Z" />
          <rect className={styles.door} x="13" y="15" width="6" height="8" />
        </symbol>
      </defs>
      <text className={styles.slogan} x={width / 2} y={19} textAnchor="middle">
        {slogan}
      </text>
      {districts.map((district, index) => {
        const { x, y } = origin(index);
        const select = () => {
          onSelect(district.id);
        };
        return (
          <g
            key={district.id}
            className={styles.district}
            data-locked={district.isLocked}
            data-selected={district.isSelected}
            data-tone={index % 4}
            transform={`translate(${x} ${y})`}
            role="button"
            tabIndex={0}
            aria-pressed={district.isSelected}
            aria-label={
              district.isLocked
                ? `${district.name} (verrouillé)`
                : district.name
            }
            onClick={select}
            onKeyDown={(event) => {
              if (!isActivation(event)) {
                return;
              }
              event.preventDefault();
              select();
            }}
          >
            <rect
              className={styles.block}
              width={cell.width}
              height={cell.height}
            />
            <text className={styles.name} x={10} y={22}>
              {district.name}
            </text>
            {district.isLocked ? (
              <g>
                <text className={styles.locked} x={10} y={48}>
                  Quartier verrouillé
                </text>
                {district.conditions.map((condition, line) => (
                  <text
                    key={condition}
                    className={styles.condition}
                    x={10}
                    y={68 + line * 16}
                  >
                    {condition}
                  </text>
                ))}
              </g>
            ) : (
              district.buildings.map((building, slotIndex) => (
                <Building
                  key={building.id}
                  building={building}
                  x={10 + (slotIndex % slot.perRow) * slot.width}
                  y={38 + Math.floor(slotIndex / slot.perRow) * slot.height}
                />
              ))
            )}
            {district.isSelected ? (
              <rect
                className={styles.selection}
                x={3}
                y={3}
                width={cell.width - 6}
                height={cell.height - 6}
              />
            ) : null}
          </g>
        );
      })}
      <g
        className={styles.legend}
        transform={`translate(${cell.gap} ${mapBottom + 6})`}
        aria-hidden="true"
      >
        <rect className={styles.swatchOpen} width="14" height="10" />
        <text x="20" y="9">
          Ouvert
        </text>
        <rect className={styles.swatchLocked} x="76" width="14" height="10" />
        <text x="96" y="9">
          Verrouillé
        </text>
        <use href="#city-production" x="170" y="-4" width="20" height="15" />
        <text x="194" y="9">
          Production
        </text>
        <use href="#city-commerce" x="262" y="-4" width="20" height="15" />
        <text x="286" y="9">
          Commerce
        </text>
        <rect className={styles.scaleBar} x="0" y="26" width="60" height="4" />
        <text x="68" y="31">
          200 m (échelle indicative, plan non contractuel)
        </text>
      </g>
    </svg>
  );
};
