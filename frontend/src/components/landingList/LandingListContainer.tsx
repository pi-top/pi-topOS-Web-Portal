import React from 'react';
import { LandingElement } from '../landingContainer/LandingContainer';
import LandingList from './LandingList';

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
  return (
    <LandingList
      activeElement={activeElement}
      onClick={onClick}
      elements={elements}
      className={className}
    />
  );
};
