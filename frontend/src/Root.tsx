import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import OnboardingApp from "./components/onboarding_app/App";
import FinalOnboardingPageContainer from "./pages/finalOnboardingPage/FinalOnboardingPageContainer";
import ErrorPage from "./pages/errorPage/ErrorPage";
import AboutPageContainer from "./pages/aboutPage/AboutPageContainer";
import UpgradePageContainer from "./pages/upgradePage/UpgradePageContainer";
import LandingPage from "./pages/landingPage/LandingPage";
import StandaloneWifiPageContainer from "./pages/wifiPage/StandaloneWifiPageContainer";
import RoverControllerLandingPage from "./components/roverControllerLanding/RoverControllerLanding";
import WebVncDesktopLanding from "./components/webVncDesktopLanding/WebVncDesktopLanding";

export default () => (
  <ErrorBoundary
    fallback={
      <ErrorBoundary fallback={<ErrorPage />}>
        <FinalOnboardingPageContainer />
      </ErrorBoundary>
    }
  >
    <BrowserRouter>
      <Switch>
        <Route path="/onboarding" component={OnboardingApp} />
        <Route path="/about" component={AboutPageContainer} />
        <Route path="/wifi" render={() => <StandaloneWifiPageContainer />} />
        <Route path="/desktop" render={() => <WebVncDesktopLanding standalone/>} />
        <Route path="/rover" render={() => <RoverControllerLandingPage standalone />} />
        <Route
          path="/updater"
          render={() => <UpgradePageContainer hideSkip />}
        />
        <Route component={LandingPage} />
      </Switch>
    </BrowserRouter>
  </ErrorBoundary>
);
