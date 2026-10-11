import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import styles from './Badge.module.css';

const badge = cva(styles.badge, {
  variants: {
    tone: {
      neutral: styles.neutral,
      info: styles.info,
      alert: styles.alert,
    },
  },
  defaultVariants: { tone: 'neutral' },
});

type BadgeProperties = VariantProps<typeof badge> & { children: ReactNode };

export const Badge = ({ children, tone }: BadgeProperties) => (
  <span className={badge({ tone })}>{children}</span>
);
