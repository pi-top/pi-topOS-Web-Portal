import React, { useState, useEffect } from "react";

import { Route, Switch } from "react-router-dom";

import TourSplashPage from "../../pages/tourSplashPage/TourSplashPage";
import LinksPage from "../../pages/linksPage/LinksPage";
import ErrorPage from "../../pages/errorPage/ErrorPage";
import BuildInformation from "../buildInformation/BuildInformation";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import getFurtherUrl from "../../services/getFurtherUrl";

import getBuildInfo from "../../services/getBuildInfo";

import { BuildInfo } from "../../types/Build";
import { PageRoute } from "../../types/Page";

export default () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>();
  const [docsUrl, setDocsUrl] = useState("https://docs.pi-top.com");
  const [furtherUrl, setFurtherUrl] = useState("https://further.pi-top.com/start");
  const [isOnWebUi, setIsOnWebUi] = useState(false);

  const updateSDKUrl = () => {
    getPythonSDKDocsUrl()
      .then((url_data) => {
        if (isOnWebUi || url_data.url.startsWith("http")) {
            setDocsUrl(url_data.url);
        }
      })
  };

  const updateFurtherUrl = () => {
    getFurtherUrl().then((url_data) => setFurtherUrl(url_data.url))
  };

  const readUserAgent = () => {
    setIsOnWebUi(window.navigator.userAgent === "web-renderer");
  }

  useEffect(() => {
    Promise.all([updateSDKUrl(), updateFurtherUrl(), readUserAgent()]);
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
                            isOnWebUi={isOnWebUi}
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
