import React, { useState } from 'react';
import cx from "classnames";
import styles from './Landing.module.css';

import LandingListContainer from "../landingList/LandingListContainer";
import LandingDetailContainer from "../landingDetail/LandingDetailContainer";
import { LandingElement } from './LandingContainer';

export type Props = {
  elements: LandingElement[];
};

export default ({ elements }: Props) => {
  const [ selectedElement, setSelectedElement ] = useState<LandingElement>(elements[0])

  return (
    <div className={cx(styles.container)}>
        <LandingListContainer
          elements={elements}
          activeElement={selectedElement}
          onClick={(element: LandingElement) => setSelectedElement(element)}
          className={styles.landingList}
        />

        <div className={styles.landingPage}>
				  <LandingDetailContainer element={selectedElement}/>
        </div>
    </div>
  );
};
