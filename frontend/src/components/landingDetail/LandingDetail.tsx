import React from 'react';
import cx from "classnames";
import styles from './LandingDetail.module.css';

import { LandingElement } from '../landingContainer/LandingContainer';

export type Props = {
  element: LandingElement;
};

export default ({ element } : Props) => {
  return (
    <div className={cx(styles.container)}>
      <embed type="text/html" src={element.url} width="100%" height="100%" />
    </div>
  );
};
