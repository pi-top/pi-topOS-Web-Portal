import React from 'react';
import styles from './LandingHeader.module.css';

export default () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <h1>
          Welcome to <span className="green">pi-topOS</span>
        </h1>
      </div>
    </header>
  );
};
