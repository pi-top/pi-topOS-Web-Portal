import React, { useState, useEffect } from 'react';
import cx from "classnames";
import styles from './Landing.module.css';

import LandingListContainer from "../landingList/LandingListContainer";
import LandingDetailContainer from "../landingDetail/LandingDetailContainer";
import { LandingPageElement } from '../landing_app/App';

export type Props = {
  pages: LandingPageElement[];
};

export default ({ pages }: Props) => {
  const [ selectedElement, setSelectedElement ] = useState<LandingPageElement | undefined >()

  useEffect(() => {
    pages && pages.length > 0 && setSelectedElement(pages[0]);
  }, [pages])

  return (
    <div className={cx(styles.container)}>
        { pages && selectedElement !== undefined && (
          <>
          <LandingListContainer
            pages={pages}
            activeElement={selectedElement}
            onClick={(element: LandingPageElement) => setSelectedElement(element)}
            className={styles.landingList}
          />

          <div className={styles.landingPage}>
            <LandingDetailContainer page={selectedElement}/>
          </div>

          </>
        )}
    </div>
  );
};
