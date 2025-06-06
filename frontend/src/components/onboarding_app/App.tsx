import React, { useState, useEffect } from "react";

import { Route, Switch, useLocation } from "react-router-dom";

import styles from "./App.module.css";
import SplashPage from "../../pages/splashPage/SplashPage";
import WifiPageContainer from "../../pages/wifiPage/WifiPageContainer";
import UpgradePageContainer from "../../pages/upgradePage/UpgradePageContainer";
import LanguagePageContainer from "../../pages/languagePage/LanguagePageContainer";
import CountryPageContainer from "../../pages/countryPage/CountryPageContainer";
import RegistrationPageContainer from "../../pages/registrationPage/RegistrationPageContainer";
import FinalOnboardingPageContainer from "../../pages/finalOnboardingPage/FinalOnboardingPageContainer";
import ErrorPage from "../../pages/errorPage/ErrorPage";
import BuildInformation from "../buildInformation/BuildInformation";

import getBuildInfo from "../../services/getBuildInfo";

import { BuildInfo } from "../../types/Build";
import { Page, PageRoute } from "../../types/Page";
import { Network } from "../../types/Network";
import HotspotDisconnectDialog from "../../pages/hotspotDisconnectDialog/HotspotDisconnectDialog";
import closeFirstBootAppWindow from "../../services/closeFirstBootAppWindow";
import { runningOnWebRenderer } from "../../helpers/utils";
import CloseButton from "../closeButton/CloseButton";
import stopFirstBootAppAutostart from "../../services/stopFirstBootAppAutostart";
import isOnOpenboxSession from "../../services/isOnOpenboxSession";
import RestartPageContainer from "../../pages/restartPage/RestartPageContainer";

export default () => {
  const [buildInfo, setBuildInfo] = useState<BuildInfo>();
  const [completedPages, setCompletedPages] = useState<Page[]>([]);
  const [expectedUserCountry, setExpectedUserCountry] = useState("US");
  const [email, setEmail] = useState("");
  const [connectedNetwork, setConnectedNetwork] = useState<Network>();
  const [skipUpgradePage, setSkipUpgradePage] = useState(false);
  const [enableDisconnectedFromApDialog, setEnableDisconnectedFromApDialog] =
    useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    getBuildInfo()
      .then(setBuildInfo)
      .catch(() => null);
  }, []);

  useEffect(() => {
    setShowCloseButton(runningOnWebRenderer());
  }, []);

  const onCloseButtonClick = async () => {
    await stopFirstBootAppAutostart().catch(() => null);
    await closeFirstBootAppWindow().catch(() => null);
  };

  const addCompleted = (page: Page) => {
    if (!completedPages.includes(page)) {
      setCompletedPages([...completedPages, page]);
    }
  };

  const pathDisplaysApDisconnectDialog = (path: string) => {
    return ![PageRoute.Upgrade.toString(), PageRoute.Finish.toString()].includes(path);
  };

  return (
    <>
      <Switch>
        <Route
          exact
          path={PageRoute.Splash}
          render={({ history }) => (
            <SplashPage goToNextPage={() => history.push(PageRoute.Language)} />
          )}
        />

        <Route
          exact
          path={PageRoute.Language}
          render={({ history }) => (
            <LanguagePageContainer
              isCompleted={completedPages.includes(Page.Language)}
              setExpectedUserCountry={setExpectedUserCountry}
              goToNextPage={() => {
                addCompleted(Page.Language);

                history.push(PageRoute.Country);
              }}
            />
          )}
        />

        <Route
          exact
          path={PageRoute.Country}
          render={({ history }) => (
            <CountryPageContainer
              defaultCountry={expectedUserCountry}
              isCompleted={completedPages.includes(Page.Country)}
              goToPreviousPage={() => history.push(PageRoute.Language)}
              goToNextPage={() => {
                addCompleted(Page.Country);

                history.push(PageRoute.Wifi);
              }}
            />
          )}
        />

        <Route
          exact
          path={PageRoute.Wifi}
          render={({ history }) => (
            <WifiPageContainer
              connectedNetwork={connectedNetwork}
              setConnectedNetwork={setConnectedNetwork}
              goToPreviousPage={() => history.push(PageRoute.Country)}
              goToNextPage={(isConnected: boolean) => {
                history.push(isConnected ? PageRoute.Upgrade : PageRoute.Registration);
                setSkipUpgradePage(!isConnected);
                addCompleted(Page.Wifi);
              }}
            />
          )}
        />

        <Route
          exact
          path={PageRoute.Upgrade}
          render={({ history }) => (
            <UpgradePageContainer
              isCompleted={completedPages.includes(Page.Upgrade)}
              skipSystemUpgrade={true}
              goToPreviousPage={() => history.push(PageRoute.Wifi)}
              goToNextPage={() => {
                addCompleted(Page.Upgrade);
                history.push(PageRoute.Registration);
                window.location.reload();
              }}
              setEnableDisconnectedFromApDialog={setEnableDisconnectedFromApDialog}
            />
          )}
        />

        <Route
          exact
          path={PageRoute.Registration}
          render={({ history }) => (
            <RegistrationPageContainer
              email={email}
              setEmail={setEmail}
              goToPreviousPage={() => {
                history.push(skipUpgradePage ? PageRoute.Wifi : PageRoute.Upgrade);
              }}
              goToNextPage={async () => {
                addCompleted(Page.Registration);
                const shouldGoToRestartPage = await isOnOpenboxSession();
                history.push(shouldGoToRestartPage ? PageRoute.RestartPage : PageRoute.Finish);
              }}
            />
          )}
        />

        <Route
          path={PageRoute.Finish}
          render={({ history }) => (
            <FinalOnboardingPageContainer
              goToPreviousPage={() => history.push(PageRoute.Registration)}
              goToNextPage={() => {
                history.push(PageRoute.LandingSplash);
                window.location.reload();
              }}
            />
          )}
        />

        <Route
          path={PageRoute.RestartPage}
          render={({ history }) => (
            <RestartPageContainer
              goToPreviousPage={() => history.push(PageRoute.Registration)}
            />
          )}
        />

        <Route component={ErrorPage} />
      </Switch>

      {showCloseButton && <CloseButton onClose={onCloseButtonClick} />}
      <BuildInformation info={buildInfo} className={styles.buildInfo} />
      <HotspotDisconnectDialog enabled={pathDisplaysApDisconnectDialog(useLocation().pathname) && enableDisconnectedFromApDialog} />
    </>
  );
};
