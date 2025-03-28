import React, { useEffect, useState } from "react";
import cx from "classnames";

import styles from "./LandingPage.module.css";

import LandingHeader from "../../components/landingHeader/LandingHeader";
import Landing from "../../components/landing/Landing";
import LandingPageTemplate from "../../components/landingPageTemplate/LandingPageTemplate";
import introScreen from "../../assets/images/intro-screen.png";
import registrationScreen from "../../assets/images/registration-screen.png";
import keyboardScreen from "../../assets/images/keyboard-screen.png";
import wifiPageScreen from "../../assets/images/wifi-screen.png";
import upgradePage from "../../assets/images/upgrade-page.png";
import rebootScreen from "../../assets/images/reboot-screen.png";

import getFurtherUrl from "../../services/getFurtherUrl";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import openFurther from "../../services/openFurther";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
import RoverControllerLanding from "../../components/roverControllerLanding/RoverControllerLanding";
import openWifi from "../../services/openWifi";
import openUpdater from "../../services/openUpdater";
import openOsDownload from "../../services/openOsDownload";
import WebVncDesktopLanding from "../../components/webVncDesktopLanding/WebVncDesktopLanding";
import CloseButton from "../../components/closeButton/CloseButton";
import { runningOnWebRenderer } from "../../helpers/utils";
import stopOnboardingAutostart from "../../services/stopOnboardingAutostart";
import closeOnboardingWindow from "../../services/closeOnboardingWindow";


const landingPages = [
  {
    title: "Learn by making on Further",
    id: "further",
    detail: (
      <LandingPageTemplate
        key="further"
        title="Learn by making on Further"
        urlInfo={{
          onWebRenderer: openFurther,
          defaultUrl: "http://further.pi-top.com",
          urlService: getFurtherUrl,
        }}
        message={
          <>
            Learn to code through guided, hands-on electronics challenges. Build
            a puzzle-box, a rover, a video game and much more!
            <br />
            Click "Let's Go" to start your pi-top journey!
          </>
        }
        prompt={
          <>
            Learn by making on <span className="green">Further</span> - Start
            here!
          </>
        }
        image={introScreen}
      />
    ),
  },
  {
    title: "Remote Desktop",
    id: "vnc",
    detail: <WebVncDesktopLanding />,
  },
  {
    title: "pi-top System Update",
    id: "updater",
    detail: (
      <LandingPageTemplate
        key="updater"
        title="pi-top System Update"
        urlInfo={{
          onWebRenderer: openUpdater,
          defaultUrl: "/updater",
        }}
        message={
          <>
            It's important to regularly update your pi-top to get access to the
            latest features, improvements and security updates!
            <br />
          </>
        }
        prompt={
          <>
            Keep your <span className="green">pi-top</span> up to date
          </>
        }
        image={upgradePage}
      />
    ),
  },
  {
    title: "Wi-Fi Settings",
    id: "wifi",
    detail: (
      <LandingPageTemplate
        key="wifi"
        title="Wi-Fi Settings"
        urlInfo={{
          onWebRenderer: openWifi,
          defaultUrl: "/wifi",
        }}
        message={
          <>Change the Wi-Fi network your pi-top is connected to here!</>
        }
        prompt={
          <>
            Change <span className="green">Wi-Fi</span> settings
          </>
        }
        image={wifiPageScreen}
      />
    ),
  },
  {
    title: "Python SDK",
    id: "sdk",
    detail: (
      <LandingPageTemplate
        key="sdk"
        title="Python SDK"
        urlInfo={{
          defaultUrl: "http://docs.pi-top.com",
          urlService: getPythonSDKDocsUrl,
          onWebRenderer: openPythonSDKDocs,
        }}
        message={
          <>
            The Software Development Kit (SDK) provides an easy-to-use framework
            to interact with your pi-top using python. It also contains CLI
            utilities to manage your pi-top using the terminal.
            <br />
            Press the "Let's Go" button to open its documentation and start
            making!
          </>
        }
        prompt={
          <>
            Checkout the Python <span className="green">SDK</span>
          </>
        }
        image={registrationScreen}
      />
    ),
  },
  {
    title: "Rover Controller",
    id: "rover",
    detail: <RoverControllerLanding />,
  },
  {
    title: "pi-top Knowledge Base",
    id: "kb",
    detail: (
      <LandingPageTemplate
        key="kb"
        title="pi-top Knowledge Base"
        urlInfo={{
          defaultUrl: "https://knowledgebase.pi-top.com",
          onWebRenderer: openKnowledgeBase,
        }}
        message={
          <>
            Do you have any questions or need help with your device?
            <br />
            Go and checkout our Knowledge Base, a comprehensive technical guide
            for your pi-top products.
          </>
        }
        prompt={
          <>
            Knowledge <span className="green">Base</span>
          </>
        }
        image={keyboardScreen}
      />
    ),
  },
  {
    title: "Reinstall pi-topOS",
    id: "reinstall-os",
    detail: (
      <LandingPageTemplate
        key="reinstall-os"
        title="Reinstall pi-topOS"
        urlInfo={{
          defaultUrl: "https://www.pi-top.com/resources/download-os",
          onWebRenderer: openOsDownload,
        }}
        message={
          <>
            Download and find instructions to install the newest version of{" "}
            <span className="green">pi-topOS</span>
          </>
        }
        prompt={
          <>
            Reinstall <span className="green">pi-topOS</span>
          </>
        }
        image={rebootScreen}
      />
    ),
  },
];

export default () => {
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    setShowCloseButton(runningOnWebRenderer());
  }, []);

  const onCloseButtonClick = async () => {
    await stopOnboardingAutostart().catch(() => null);
    await closeOnboardingWindow().catch(() => null);
  };

  return (
    <div className={cx(styles.layout)}>
      {showCloseButton && <CloseButton onClose={onCloseButtonClick} />}
      <LandingHeader />
      <Landing pages={landingPages} />
    </div>
  );
};
