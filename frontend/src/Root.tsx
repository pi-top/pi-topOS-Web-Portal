import React from "react";
import { BrowserRouter, Route } from 'react-router-dom';

import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import OnboardingApp from "./components/onboarding_app/App";
import RestartPageContainer from "./pages/restartPage/RestartPageContainer";
import ErrorPage from "./pages/errorPage/ErrorPage";
import AboutPageContainer from "./pages/aboutPage/AboutPageContainer";
import UpgradePageContainer from "./pages/upgradePage/UpgradePageContainer";
import closeOsUpdaterWindow from "./services/closeOsUpdaterWindow";
import LandingPage from "./pages/landingPage/LandingPage";
import FurtherPage from "./pages/furtherPage/FurtherPage";
import PythonSDKPage from "./pages/pythonSdkPage/PythonSDKPage";
import KnowledgeBasePage from "./pages/kbPage/KnowledgeBasePage";
import RoverPage from "./pages/roverPage/RoverPage";

export default () => (
  <ErrorBoundary
    fallback={
      <ErrorBoundary fallback={<ErrorPage />}>
        <RestartPageContainer globalError />
      </ErrorBoundary>
    }
  >
  <BrowserRouter>
    <Route path="/landing" component={LandingPage} />
    <Route path="/further" component={FurtherPage} />
    <Route path="/python-sdk" component={PythonSDKPage} />
    <Route path="/knowledge-base" component={KnowledgeBasePage} />
    <Route path="/rover" component={RoverPage} />
    <Route path="/onboarding" component={OnboardingApp} />
    <Route path="/about" component={AboutPageContainer} />
    <Route path="/updater"
      render={()=>{return(
        <UpgradePageContainer
          goToNextPage={() => {closeOsUpdaterWindow()}}
        />
      )}}
    />
  </BrowserRouter>

  </ErrorBoundary>
);
