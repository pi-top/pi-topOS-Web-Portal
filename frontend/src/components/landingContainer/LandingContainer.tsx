import React from 'react';
import Landing from './Landing';


export type LandingElement = {
  url: string;
  title: string;
  name: string;
};

const elements = [
  {url: '/onboarding', title: 'Onboarding', name: "onboarding"},
  {url: '/about', title: 'About pi-topOS!', name: "about"},
  {url: '/updater', title: 'OS Updater', name: "updater"},
  {url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Youtube', name: "youtube"},
]

export default () => {
  return (
    <Landing elements={elements} />
  );
};
