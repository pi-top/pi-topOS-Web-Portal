import React from 'react';
import cx from "classnames";
import styles from './LandingDetail.module.css';
import { LandingPageElement } from '../landing_app/App';

export type Props = {
  page?: LandingPageElement;
};

export default ({ page } : Props) => {
  return (
    <div className={cx(styles.container)}>
      {page && <embed type="text/html" src={page.url} width="100%" height="100%" />}
    </div>
  );
};
