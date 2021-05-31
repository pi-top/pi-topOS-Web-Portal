import React, { useState, useEffect } from "react";

import { Route, Switch } from "react-router-dom";

import TourSplashPage from "../../pages/tourSplashPage/TourSplashPage";
import LinksPage from "../../pages/linksPage/LinksPage";
import ErrorPage from "../../pages/errorPage/ErrorPage";
import BuildInformation from "../buildInformation/BuildInformation";

import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import getFurtherUrl from "../../services/getFurtherUrl";
import getBuildInfo from "../../services/getBuildInfo";

import { runningOnWebRenderer } from "../../helpers/utils";


import { BuildInfo } from "../../types/Build";
import { PageRoute } from "../../types/Page";

export default () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>();
  const [docsUrl, setDocsUrl] = useState("https://docs.pi-top.com");
  const [furtherUrl, setFurtherUrl] = useState("https://further.pi-top.com/start");

  const updateSDKUrl = () => {
    getPythonSDKDocsUrl()
      .then((url_data) => {
        if (runningOnWebRenderer() || url_data.url.startsWith("http")) {
            setDocsUrl(url_data.url);
        }
      })
      .catch(() => null) // will use default url
  };

  const updateFurtherUrl = () => {
    getFurtherUrl()
      .then((url_data) => setFurtherUrl(url_data.url))
      .catch(() => null) // will use default url
  };

  useEffect(() => {
    Promise.all([updateSDKUrl(), updateFurtherUrl()]);
  }, []);

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
          render={() => (<LinksPage
                            pythonDocsUrl={docsUrl}
                            furtherUrl={furtherUrl}
                        />)}
        />

        <Route component={ErrorPage} />
      </Switch>
      <BuildInformation info={buildInfo} />
    </>
  );
};
