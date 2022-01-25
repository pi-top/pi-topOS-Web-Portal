import React from "react";
import cx from "classnames";

import styles from "./LandingPage.module.css";

import LandingHeader from "../../components/landingHeader/LandingHeader";
import Landing from "../../components/landing/Landing";
import LandingPageTemplate from "../../pages/landingPageTemplate/LandingPageTemplate";
import introScreen from "../../assets/images/intro-screen.png";
import registrationScreen from "../../assets/images/registration-screen.png";
import upgradePage from "../../assets/images/upgrade-page.png";
import keyboardScreen from "../../assets/images/keyboard-screen.png";

import getFurtherUrl from "../../services/getFurtherUrl";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import openFurther from "../../services/openFurther";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";

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
        message="A community of pi-top owners who like hands on learning.  It's time to get you started and show you a bit about how Further works. Grab your pi-top and hit next to continue."
        prompt={<>Learn by making on <span className="green">Further =)</span></>}
        image={introScreen}
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
        message={<>
          The Software Development Kit (SDK) provides an easy-to-use framework to interact with your pi-top using python. It also contains CLI utilities to manage your pi-top using the terminal.<br />Press the "Let's Go" button to open its documentation and start making!
        </>}
        prompt={<>Checkout the Python <span className="green">SDK</span></>}
        image={registrationScreen}
      />
    ),
  },
  {
    title: "Rover Controller",
    id: "rover",
    detail: (
      <LandingPageTemplate
        key="rover"
        title="Rover Controller"
        urlInfo={{
          defaultUrl: "http://docs.pi-top.com",
          onWebRenderer: openPythonSDKDocs,
        }}
        message="Take adventures with your very own pi-top[4] Mars rover!"
        prompt={<>Rover <span className="green">Controller</span></>}
        image={upgradePage}
      />
    ),
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
        message="Do you have any questions or need help with your device? Go and checkout our Knowledge Base, a comprehensive technical guide for your pi-top products."
        prompt={<>Knowledge <span className="green">Base</span></>}
        image={keyboardScreen}
      />
    )
  },
];

export default () => {
  return (
    <div className={cx(styles.layout)}>
      <LandingHeader />
      <Landing pages={landingPages}/>
    </div>
  );
};
