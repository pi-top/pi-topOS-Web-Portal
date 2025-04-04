import React from 'react';
import styles from './Header.module.css';


export default () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
          <div className={styles.logo} />
      </div>
    </header>
  );
};
