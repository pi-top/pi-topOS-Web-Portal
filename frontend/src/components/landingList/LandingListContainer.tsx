import React from 'react';
import { LandingPageElement } from '../../components/landing/Landing';
import LandingList from './LandingList';

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
  return (
    <LandingList
      activeElement={activeElement}
      onClick={onClick}
      pages={pages}
      className={className}
    />
  );
};
