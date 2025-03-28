import React from 'react';
import styles from './Header.module.css';
import MaskedDiv from '../atoms/masked/MaskedDiv';
import Button from '../atoms/button/Button';
import closeButtonImage from "../../assets/images/landing-close-button.svg";
import closePtOsLandingWindow from '../../services/closePtOsLandingWindow';
import { runningOnWebRenderer } from '../../helpers/utils';


export default () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
          <div className={styles.logo} />
      </div>
      {runningOnWebRenderer() &&
        <MaskedDiv
          className={styles.closeButtonDiv}
          mask={`url(${closeButtonImage})`}
        >
          <Button
            className={styles.closeButton}
            onClick={() => closePtOsLandingWindow().catch(() => null)}
            aria-label="close-window"
          >
          </Button>
        </MaskedDiv>
      }
    </header>
  );
};
