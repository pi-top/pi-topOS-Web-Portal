import React from "react";

import { Route, Switch } from "react-router-dom";

import TourSplashPage from "../../pages/tourSplashPage/TourSplashPage";
import LinksPage from "../../pages/linksPage/LinksPage";
import ErrorPage from "../../pages/errorPage/ErrorPage";

import { PageRoute } from "../../types/Page";

export default () => {
  return (
    <>
      <Switch>
        <Route
          exact
          path={PageRoute.TourSplash}
          render={({ history }) => (
            <TourSplashPage goToNextPage={() => history.push(PageRoute.Links)} />
          )}
        />

        <Route
          exact
          path={PageRoute.Links}
          render={() => (<LinksPage />)}
        />

        <Route component={ErrorPage} />
      </Switch>
    </>
  );
};
