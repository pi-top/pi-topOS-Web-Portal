import React from "react";
import { BrowserRouter, Route } from 'react-router-dom';

import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import OnboardingApp from "./components/onboarding_app/App";
import RestartPageContainer from "./pages/restartPage/RestartPageContainer";
import ErrorPage from "./pages/errorPage/ErrorPage";
import AboutPageContainer from "./pages/aboutPage/AboutPageContainer";
import UpgradePageContainer from "./pages/upgradePage/UpgradePageContainer";
import closeOsUpdaterWindow from "./services/closeOsUpdaterWindow";
import LandingApp from "./components/landing_app/App";

export default () => (
  <ErrorBoundary
    fallback={
      <ErrorBoundary fallback={<ErrorPage />}>
        <RestartPageContainer globalError />
      </ErrorBoundary>
    }
  >
  <BrowserRouter>
    <Route path="/landing" component={LandingApp} />
    <Route path="/onboarding" component={OnboardingApp} />
    <Route path="/about" component={AboutPageContainer} />
    <Route path="/updater" render={() => <UpgradePageContainer goToNextPage={() => {closeOsUpdaterWindow()}}/>}
    />
  </BrowserRouter>

  </ErrorBoundary>
);
