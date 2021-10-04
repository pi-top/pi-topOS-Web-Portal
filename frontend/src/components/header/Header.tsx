import React from 'react';
import styles from './Header.module.css';

type Props = {
};

export default ({
}: Props) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
          <div className={styles.logo} />
      </div>
    </header>
  );
};
