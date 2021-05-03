import React, { useState, useEffect } from "react";

import linkScreen from "../../assets/images/upgrade-page.png";
import styles from "./LinksPage.module.css";
import Layout from "../../components/layout/Layout";
import Button from "../../components/atoms/button/Button";
import closePtBrowser from "../../services/closePtBrowser";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
import openFurther from "../../services/openFurther";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import stopTourAutostart from "../../services/stopTourAutostart";


export type Props = {
  goToNextPage: () => void;
};

export default ({ goToNextPage }: Props) => {
  const furtherUrl = "https://further.pi-top.com";
  const kbUrl = "https://knowledgebase.pi-top.com";
  const [docsUrl, setDocsUrl] = useState("");
  const [isOnWebUi, setIsOnWebUi] = useState(false);

  const getSDKUrl = () => {
    getPythonSDKDocsUrl()
      .then((url) => setDocsUrl(url))
  };

  const getBrowserData = () => {
    setIsOnWebUi(window.navigator.userAgent === "pt-web-ui");
  }

  useEffect(() => {
    Promise.all([getSDKUrl(), getBrowserData()]);
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
