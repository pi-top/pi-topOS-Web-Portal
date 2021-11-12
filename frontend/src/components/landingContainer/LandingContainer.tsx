import React from 'react';
import { LandingPageElement } from '../landing_app/App';
import Landing from './Landing';

export type Props = {
  pages: LandingPageElement[];
};

export default ({pages} : Props) => {
  return (
    <Landing pages={pages} />
  )
};
