import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import OnboardingApp from "./components/onboarding_app/App";
import RestartPageContainer from "./pages/restartPage/RestartPageContainer";
import ErrorPage from "./pages/errorPage/ErrorPage";
import AboutPageContainer from "./pages/aboutPage/AboutPageContainer";
import UpgradePageContainer from "./pages/upgradePage/UpgradePageContainer";
import LandingPage from "./pages/landingPage/LandingPage";
import StandaloneWifiPageContainer from "./pages/wifiPage/StandaloneWifiPageContainer";

export default () => (
  <ErrorBoundary
    fallback={
      <ErrorBoundary fallback={<ErrorPage />}>
        <RestartPageContainer globalError />
      </ErrorBoundary>
    }
  >
    <BrowserRouter>
      <Switch>
        <Route path="/onboarding" component={OnboardingApp} />
        <Route path="/about" component={AboutPageContainer} />
        <Route path="/wifi" component={StandaloneWifiPageContainer} />
        <Route
          path="/updater"
          render={() => <UpgradePageContainer hideSkip />}
        />
        <Route component={LandingPage} />
      </Switch>
    </BrowserRouter>
  </ErrorBoundary>
);
