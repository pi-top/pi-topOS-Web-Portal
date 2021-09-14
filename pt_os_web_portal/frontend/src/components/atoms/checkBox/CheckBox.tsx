import React, { ReactNode } from 'react';
import cx from 'classnames';

import styles from './CheckBox.module.css';
import checkboxBg from '../../../assets/images/radio.svg';

export type Props = {
  name: string;
  id?: string;
  label: string;
  onChange: () => void;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  textLeft?: boolean;
  errorMessage?: string;
  inline?: boolean;
  icon?: ReactNode;
  noCheckIcon?: boolean;
  singleSelectUi?: boolean;
};

export default ({
  name,
  id = `checkbox-${name}`,
  className,
  label,
  disabled,
  textLeft,
  checked,
  errorMessage,
  inline,
  onChange,
  icon,
  noCheckIcon,
  singleSelectUi,
}: Props) => (
  <div className={cx(className, { [styles.inline]: inline })}>
    <input
      disabled={disabled}
      checked={checked}
      className={styles.checkbox}
      type="checkbox"
      name={name}
      id={id}
      onChange={() => disabled || onChange()}
    />
    <label
      className={cx(styles.label, {
        [styles.inline]: inline,
        [styles.noCheckIcon]: noCheckIcon,
        [styles.singleSelectUi]: singleSelectUi,
        [styles.isSelected]: checked,
      })}
      htmlFor={id}
    >
      {textLeft && (
        <span className={styles.labelText}>
          {label}
          {icon}
          <span className={styles.errorMsg}>{errorMessage}</span>
        </span>
      )}

      <span
        className={styles.input}
        style={{ backgroundImage: `url(${checkboxBg})` }}
      >
        <span
          className={cx(styles.checked, {
            [styles.hidden]: !checked,
          })}
        />
      </span>

      {!textLeft && (
        <span className={styles.labelText}>
          {label}
          {icon}
          <span className={styles.errorMsg}>{errorMessage}</span>
        </span>
      )}
    </label>
  </div>
);
