import React from 'react';
import cx from "classnames";
import styles from './LandingList.module.css';

import { LandingElement } from '../landingContainer/LandingContainer';
import Button from '../atoms/button/Button';

export type Props = {
  activeElement: LandingElement;
  elements: LandingElement[];
  onClick: (element: LandingElement) => void;
  className?: string;
};

export default ({
  activeElement,
  elements,
  onClick,
  className = '',
}: Props) => {

  const renderElements = (elements: LandingElement[]) => {
    return (
      elements.map(function(element, key) {
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
      {renderElements(elements)}
    </div>
  );
};
