import React from "react";
import { BrowserRouter, Route } from 'react-router-dom';

import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import OnboardingApp from "./components/onboarding_app/App";
import TourApp from "./components/tour_app/App";
import RestartPageContainer from "./pages/restartPage/RestartPageContainer";
import ErrorPage from "./pages/errorPage/ErrorPage";

export default () => (
  <ErrorBoundary
    fallback={
      <ErrorBoundary fallback={<ErrorPage />}>
        <RestartPageContainer globalError />
      </ErrorBoundary>
    }
  >
    <BrowserRouter>
      <Route path="/tour" component={TourApp} />
      <Route path="/onboarding" component={OnboardingApp} />
    </BrowserRouter>

  </ErrorBoundary>
);
