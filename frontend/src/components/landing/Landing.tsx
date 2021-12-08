import React, { useState } from "react";
import cx from "classnames";
import styles from "./Landing.module.css";

import Button from "../atoms/button/Button";

import LandingPageTemplate from "../../pages/landingPageTemplate/LandingPageTemplate";
import introScreen from "../../assets/images/intro-screen.png";
import registrationScreen from "../../assets/images/registration-screen.png";
// import upgradePage from "../../assets/images/upgrade-page.png";
// import keyboardScreen from "../../assets/images/keyboard-screen.png";

import getFurtherUrl from "../../services/getFurtherUrl";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
// import openKnowledgeBase from "../../services/openKnowledgeBase";
import openFurther from "../../services/openFurther";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
// import LandingPage from "../../pages/landingPage/LandingPage";

const pages = [
  {
    title: "Learn by making on Further",
    detail: (
      <LandingPageTemplate
        title="Learn by making on Further"
        urlInfo={{
          onWebRenderer: openFurther,
          defaultUrl: "http=//further.pi-top.com",
          urlService: getFurtherUrl,
        }}
        message="A community of pi-top owners who like hands on learning.  It's time to get you started and show you a bit about how Further works. Grab your pi-top and hit next to continue."
        prompt={
          <>
            Learn by making on <span className="green">Further =)</span>
          </>
        }
        image={introScreen}
      />
    ),
  },
  {
    title: "Python SDK",
    detail: (
      <LandingPageTemplate
        title="Python SDK"
        urlInfo={{
          defaultUrl: "http=//docs.pi-top.com",
          urlService: getPythonSDKDocsUrl,
          onWebRenderer: openPythonSDKDocs,
        }}
        message={
          'The Software Development Kit (SDK) provides an easy-to-use framework to interact with your pi-top using python. It also contains CLI utilities to manage your pi-top using the terminal.\nPress the "Let\'s Go" button to open its documentation and start making!'
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
    title: "SDK Docs",
    detail: () => <embed src="https://sdkdocs.com" />,
  },
];

// const roverPage: LandingPageElement = {
//   title: "Rover Controller",
//   url: PageRoute.Rover,
//   urlInfo: {
//     defaultUrl: "http://www.google.com",
//     onWebRenderer: openPythonSDKDocs,
//   },
//   message: "Take adventures with your very own pi-top[4] Mars rover!",
//   prompt: (
//     <>
//       Rover <span className="green">Controller</span>
//     </>
//   ),
//   image: upgradePage,
// };

// const knowledgeBasePage: LandingPageElement = {
//   title: "pi-top Knowledge Base",
//   url: PageRoute.KnowledgeBase,
//   urlInfo: {
//     defaultUrl: "https://knowledgebase.pi-top.com",
//     onWebRenderer: openKnowledgeBase,
//   },
//   message:
//     "Do you have any questions or need help with your device? Go and checkout our Knowledge Base, a comprehensive technical guide for your pi-top products.",
//   prompt: (
//     <>
//       Knowledge <span className="green">Base</span>
//     </>
//   ),
//   image: keyboardScreen,
// };

export default () => {
  const [selectedElement, setSelectedElement] = useState(pages[0]);

  return (
    <div className={cx(styles.container)}>
      {pages && selectedElement !== undefined && (
        <>
          <div className={styles.landingList}>
            {pages.map((element) => (
              <div key={element.title} className={styles.elementDiv}>
                <Button
                  unstyled
                  className={cx(
                    styles.element,
                    selectedElement?.title === element.title
                      ? styles.selectedElement
                      : ""
                  )}
                  onClick={() => setSelectedElement(element)}
                >
                  <span className={styles.elementText}>{element.title}</span>
                </Button>
              </div>
            ))}
          </div>

          <div className={styles.landingPage}>
            <div className={styles.detailContainer} id="landing-detail">
              {selectedElement.detail}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
