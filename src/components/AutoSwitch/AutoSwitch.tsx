import { Switch } from '@base-ui/react/switch';
import styles from './AutoSwitch.module.css';

type AutoSwitchProperties = {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export const AutoSwitch = ({
  label,
  isChecked,
  onChange,
}: AutoSwitchProperties) => (
  <label className={styles.label}>
    <Switch.Root
      className={styles.root}
      checked={isChecked}
      onCheckedChange={onChange}
    >
      <Switch.Thumb className={styles.thumb} />
    </Switch.Root>
    {label}
  </label>
);
