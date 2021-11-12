import React from 'react';
import { LandingPageElement } from '../landing_app/App';

import LandingDetail from './LandingDetail';

export type Props = {
  page?: LandingPageElement;
};

export default ({ page } : Props) => {
  return (
    <LandingDetail page={page} />
  );
};
