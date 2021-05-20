import React, { useState, useEffect } from "react";

import linkScreen from "../../assets/images/upgrade-page.png";
import styles from "./LinksPage.module.css";
import Layout from "../../components/layout/Layout";
import Button from "../../components/atoms/button/Button";
import closePtBrowser from "../../services/closePtBrowser";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import getFurtherUrl from "../../services/getFurtherUrl";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
import openFurther from "../../services/openFurther";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import stopTourAutostart from "../../services/stopTourAutostart";


export type Props = {
  goToNextPage: () => void;
};

export default ({ goToNextPage }: Props) => {
  console.log(goToNextPage);
  const kbUrl = "https://knowledgebase.pi-top.com";
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


  return (
    <Layout
      banner={{
        src: linkScreen,
        alt: "links-screen-banner"
      }}
      prompt={
        <>
          What do you want to <span className="green">do</span>?
        </>
      }
      explanation=""
      nextButton={{
        onClick: () => {
          stopTourAutostart()
            .then(() => closePtBrowser())
          },
        label: 'Exit',
        hidden: ! isOnWebUi
      }}
      className={styles.root}
    >
      <Button className={styles.linkButton} unstyled onClick={() => isOnWebUi? openFurther() : window.open(furtherUrl)}>
        Go Further
      </Button>
      <Button className={styles.linkButton} unstyled onClick={() => isOnWebUi? openPythonSDKDocs() : window.open(docsUrl)}>
        Checkout the Python SDK
      </Button>
      <Button className={styles.linkButton} unstyled onClick={() => isOnWebUi? openKnowledgeBase() : window.open(kbUrl)}>
        Go to the Knowledge Base
      </Button>
    </Layout>
  );
};
