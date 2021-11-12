import React, { useState, useEffect } from 'react';
import getLandingPageElements from '../../services/getLandingPageElements';
import Landing from './Landing';


export type LandingElement = {
  url: string;
  title: string;
  name: string;
  visible?: boolean;
};

// const elements = [
//   {url: '/onboarding', title: 'Onboarding', name: "onboarding"},
//   {url: '/about', title: 'About pi-topOS!', name: "about"},
//   {url: '/updater', title: 'OS Updater', name: "updater"},
//   {url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Youtube', name: "youtube"},
// ]


export default () => {
  const [ elements, setElements ] = useState<LandingElement[]>([])

  useEffect(() => {
    getLandingPageElements()
      .then(setElements)
      .catch((err) => console.log(err))
  }, [])

  console.log(elements);
  return (
    <Landing elements={elements} />
  )

};
