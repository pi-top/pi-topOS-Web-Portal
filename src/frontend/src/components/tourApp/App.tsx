import React, { useState, useEffect } from "react";

import { Route, Switch } from "react-router-dom";

import TourSplashPage from "../../pages/tourSplashPage/TourSplashPage";
import LinksPage from "../../pages/linksPage/LinksPage";
import ErrorPage from "../../pages/errorPage/ErrorPage";
import BuildInformation from "../buildInformation/BuildInformation";

import getBuildInfo from "../../services/getBuildInfo";

import { BuildInfo } from "../../types/Build";
import { PageRoute } from "../../types/Page";

export default () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>();

  useEffect(() => {
    getBuildInfo()
      .then(setBuildInfo)
      .catch(() => null);
  }, []);

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
      <BuildInformation info={buildInfo} />
    </>
  );
};
