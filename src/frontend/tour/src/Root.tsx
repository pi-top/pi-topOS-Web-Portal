import React from "react";
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from "./components/errorBoundary/ErrorBoundary";
import App from "./components/app/App";
import ErrorPage from "./pages/errorPage/ErrorPage";

export default () => (
  <ErrorBoundary
    fallback={
      <ErrorBoundary fallback={<ErrorPage />}>
      </ErrorBoundary>
    }
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
