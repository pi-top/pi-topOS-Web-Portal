// import React, { ReactNode, memo, useState } from 'react';
import React, { memo } from 'react';
import cx from 'classnames';

import Button from '../atoms/button/Button';

import styles from './OptionCard.module.css';

export type OptionProps = {
  label: string;
  value: string;
  thumbnail?: string;
  selected?: boolean;
  onClick?: (value: string) => void;
  className?: string;
};


const OptionCard = ({
  label,
  value,
  thumbnail,
  selected,
  onClick,
  className,
}: OptionProps) => {
  return (
    <>
      <div className={cx(styles.root, className)}>
        <h2 className={styles.label}>{label}</h2>
        <Button
          unstyled
          onClick={() => {onClick && onClick(value)}}
          className={cx(styles.card, { [styles.selected]: selected })}
          aria-label={label}
        >
          <img className={styles.image} alt={label} src={thumbnail} />
        </Button>
      </div>

    </>
  );
};

export default memo(OptionCard);
