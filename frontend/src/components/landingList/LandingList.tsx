import React from 'react';
import cx from "classnames";
import styles from './LandingList.module.css';

import Button from '../atoms/button/Button';
import { LandingPageElement } from '../landing_app/App';

export type Props = {
  activeElement: LandingPageElement;
  pages: LandingPageElement[];
  onClick: (element: LandingPageElement) => void;
  className?: string;
};

export default ({
  activeElement,
  pages,
  onClick,
  className = '',
}: Props) => {

  const renderPages = (pages: LandingPageElement[]) => {
    return (
      pages.map(function(element, key) {
        return (
          <div key={key} className={styles.elementDiv}>
            <Button unstyled className={cx(styles.element, activeElement === element ? styles.selectedElement : "")} key={key} onClick={() => onClick(element)}>
              <span key={key} className={styles.elementText}>{element.title}</span>
            </Button>
          </div>
        )
      })
    )
  }

  return (
    <div className={cx(styles.container, className)}>
      {pages && renderPages(pages)}
    </div>
  );
};
