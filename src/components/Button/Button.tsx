import { Button as BaseButton } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

const button = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      primary: styles.primary,
      danger: styles.danger,
    },
    size: { normal: styles.normal, large: styles.large },
  },
  defaultVariants: { variant: 'default', size: 'normal' },
});

type ButtonProperties = VariantProps<typeof button> & {
  children: ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
  // Action en cours : le bouton reste visible mais ne réagit plus.
  isPending?: boolean;
  type?: 'button' | 'submit';
};

export const Button = ({
  children,
  onClick,
  isDisabled = false,
  isPending = false,
  type = 'button',
  variant,
  size,
}: ButtonProperties) => (
  <BaseButton
    className={button({ variant, size })}
    type={type}
    onClick={onClick}
    disabled={isDisabled || isPending}
    focusableWhenDisabled
    aria-busy={isPending}
  >
    {children}
    {isPending ? <span aria-hidden="true"> …</span> : null}
  </BaseButton>
);
