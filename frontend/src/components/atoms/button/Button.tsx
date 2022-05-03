import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import cx from 'classnames';

import styles from './Button.module.css';

export type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button'|'reset'|'submit';
  unstyled?: boolean;
  hidden?: boolean;
};

export default ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  unstyled = false,
  hidden,
  ...props
}: Props) => (
  <button
    className={cx(className, {
      [styles.unstyled]: unstyled,
      [styles.styled]: !unstyled,
      [styles.hidden]: hidden,
    })}
    disabled={disabled}
    onClick={onClick}
    type={type}
    {...props}
  >
    {children}
  </button>
);
