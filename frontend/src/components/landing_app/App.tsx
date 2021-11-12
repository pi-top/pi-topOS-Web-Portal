import React, { useState, useEffect, ReactElement } from "react";

import { Route, Switch } from "react-router-dom";
import LandingPage from "../../pages/landingPage/LandingPage";
import LandingPageTemplateContainer from "../../pages/landingPageTemplate/LandingPageTemplateContainer";
import introScreen from "../../assets/images/intro-screen.png";
import registrationScreen from "../../assets/images/registration-screen.png";
import upgradePage from "../../assets/images/upgrade-page.png";
import keyboardScreen from "../../assets/images/keyboard-screen.png";

import ErrorPage from "../../pages/errorPage/ErrorPage";
import isConnectedToNetwork from "../../services/isConnectedToNetwork";
import getFurtherUrl from "../../services/getFurtherUrl";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import openFurther from "../../services/openFurther";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";


export enum PageRoute {
  LandingSplash = "/landing",
  Further = "/landing/further",
  SDK = "/landing/sdk",
  Rover = "/landing/rover",
  KnowledgeBase = "/landing/kb",
}

export type UrlData = {
  defaultUrl : string,
  urlService?: () => Promise<{[s: string]: string}>,
  onWebRenderer: () => Promise<void>,
}

export type LandingPageElement = {
  url: string;
  title: string;
  message: string;
  prompt: ReactElement;
  image: string;
  urlInfo : UrlData;
  buttonLabel?: string;
};


const furtherPage: LandingPageElement = {
  title: "Learn by making on Further",
  url: PageRoute.Further,
  urlInfo: {
    onWebRenderer: openFurther,
    defaultUrl: "http://further.pi-top.com",
    urlService: getFurtherUrl,
  },
  message: "A community of pi-top owners who like hands on learning.  It's time to get you started and show you a bit about how Further works. Grab your pi-top and hit next to continue.",
  prompt: <>Learn by making on{" "}<span className="green">Further :)</span></>,
  image: introScreen,
}

const sdkPage: LandingPageElement = {
  title: "Python SDK",
  url: PageRoute.SDK,
  urlInfo: {
    defaultUrl: "http://docs.pi-top.com",
    urlService: getPythonSDKDocsUrl,
    onWebRenderer: openPythonSDKDocs,
  },
  message: "The Software Development Kit (SDK) provides an easy-to-use framework to interact with your pi-top using python. It also contains CLI utilities to manage your pi-top using the terminal.\nPress the \"Let's Go\" button to open its documentation and start making!",
  prompt: <>Checkout the Python{" "}<span className="green">SDK</span></>,
  image: registrationScreen,
}

const roverPage: LandingPageElement = {
  title: "Rover Controller",
  url: PageRoute.Rover,
  urlInfo: {
    defaultUrl: "http://www.google.com",
    onWebRenderer: openPythonSDKDocs,
  },
  message: "Take adventures with your very own pi-top[4] Mars rover!",
  prompt: <>Rover{" "}<span className="green">Controller</span></>,
  image: upgradePage,
}

const knowledgeBasePage: LandingPageElement = {
  title: "pi-top Knowledge Base",
  url: PageRoute.KnowledgeBase,
  urlInfo: {
    defaultUrl: "https://knowledgebase.pi-top.com",
    onWebRenderer: openKnowledgeBase,
  },
  message: "Do you have any questions or need help with your device? Go and checkout our Knowledge Base, a comprehensive technical guide for your pi-top products.",
  prompt: <>Knowledge{" "}<span className="green">Base</span></>,
  image: keyboardScreen,
}


export default () => {
  const [, setIsConnected] = useState(false);

  useEffect(() => {
    isConnectedToNetwork()
      .then((response) => setIsConnected(response.connected))
      .catch(() => setIsConnected(false));
  }, []);

  const landingPages = [furtherPage, sdkPage, roverPage, knowledgeBasePage]
  return (
    <>
      <Switch>
        <Route
          exact
          path={PageRoute.LandingSplash}
          component={() => <LandingPage pages={landingPages}/>}
        />
        <Route
          exact
          path={PageRoute.Further}
          render={() => <LandingPageTemplateContainer page={furtherPage}/>}
        />
        <Route
          exact
          path={PageRoute.SDK}
          render={() => <LandingPageTemplateContainer page={sdkPage}/>}
        />
        <Route
          exact
          path={PageRoute.Rover}
          render={() => <LandingPageTemplateContainer page={roverPage}/>}
        />
        <Route
          exact
          path={PageRoute.KnowledgeBase}
          render={() => <LandingPageTemplateContainer page={knowledgeBasePage}/>}
        />

        <Route component={ErrorPage} />
      </Switch>
    </>
  );
};
