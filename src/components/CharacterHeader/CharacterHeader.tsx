import styles from './CharacterHeader.module.css';

type CharacterHeaderProperties = {
  name: string;
  age: string;
  date: string;
  phase: string;
};

export const CharacterHeader = ({
  name,
  age,
  date,
  phase,
}: CharacterHeaderProperties) => (
  <header className={styles.header}>
    <h1 className={styles.name}>{name}</h1>
    <p>
      {age} · {date}
    </p>
    <p className={styles.phase}>{phase}</p>
  </header>
);
