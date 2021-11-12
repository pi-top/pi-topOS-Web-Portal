import React from 'react';

import { LandingElement } from '../landingContainer/LandingContainer';
import LandingDetail from './LandingDetail';

export type Props = {
  element?: LandingElement;
};

export default ({ element } : Props) => {
  return (
    <LandingDetail element={element} />
  );
};
