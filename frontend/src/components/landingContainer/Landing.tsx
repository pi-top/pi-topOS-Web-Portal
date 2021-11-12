import React, { useState, useEffect } from 'react';
import cx from "classnames";
import styles from './Landing.module.css';

import LandingListContainer from "../landingList/LandingListContainer";
import LandingDetailContainer from "../landingDetail/LandingDetailContainer";
import { LandingElement } from './LandingContainer';

export type Props = {
  elements: LandingElement[];
};

export default ({ elements }: Props) => {
  const [ selectedElement, setSelectedElement ] = useState<LandingElement | undefined >()

  useEffect(() => {
    elements && elements.length > 0 && setSelectedElement(elements[0]);
  }, [elements])

  return (
    <div className={cx(styles.container)}>
        { elements && selectedElement !== undefined && (
          <>
          <LandingListContainer
            elements={elements}
            activeElement={selectedElement}
            onClick={(element: LandingElement) => setSelectedElement(element)}
            className={styles.landingList}
          />

          <div className={styles.landingPage}>
            <LandingDetailContainer element={selectedElement}/>
          </div>

          </>
        )}
    </div>
  );
};
