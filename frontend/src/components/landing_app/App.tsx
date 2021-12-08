import React, { useState, useEffect, ReactElement } from "react";

import { Route, Switch } from "react-router-dom";

import ErrorPage from "../../pages/errorPage/ErrorPage";
import isConnectedToNetwork from "../../services/isConnectedToNetwork";

export enum PageRoute {
  LandingSplash = "/landing",
  Further = "/landing/further",
  SDK = "/landing/sdk",
  Rover = "/landing/rover",
  KnowledgeBase = "/landing/kb",
}

export type UrlData = {
  defaultUrl: string;
  urlService?: () => Promise<{ [s: string]: string }>;
  onWebRenderer: () => Promise<void>;
};

export type LandingPageElement = {
  title: string;
  message: string;
  prompt: ReactElement;
  image: string;
  urlInfo: UrlData;
  buttonLabel?: string;
};


export default () => {
  const [, setIsConnected] = useState(false);

  useEffect(() => {
    isConnectedToNetwork()
      .then((response) => setIsConnected(response.connected))
      .catch(() => setIsConnected(false));
  }, []);

  return (
    <>
      <Switch>


        <Route component={ErrorPage} />
      </Switch>
    </>
  );
};
