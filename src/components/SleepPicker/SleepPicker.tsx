import { useId } from 'react';
import styles from './SleepPicker.module.css';

type SleepPickerProperties = {
  // Durées proposées, dans l'ordre d'affichage (libellé court : « 8 h »).
  options: { hours: number; label: string }[];
  value: number;
  onChange: (hours: number) => void;
  // Ce que produit la durée choisie : horaire, jauge, marqueurs.
  summary: string;
};

// Choix de la durée du sommeil quotidien : une rangée de cases exclusives,
// puis ce que la durée choisie donne.
export const SleepPicker = ({
  options,
  value,
  onChange,
  summary,
}: SleepPickerProperties) => {
  const group = useId();
  return (
    <fieldset className={styles.picker}>
      <legend className={styles.legend}>Durée du sommeil</legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.hours} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={group}
              checked={option.hours === value}
              onChange={() => {
                onChange(option.hours);
              }}
            />
            <span className={styles.label}>{option.label}</span>
          </label>
        ))}
      </div>
      <p className={styles.summary} role="status">
        {summary}
      </p>
    </fieldset>
  );
};
