import React, { useState } from "react";

import linkScreen from "../../assets/images/upgrade-page.png";
import styles from "./LinksPage.module.css";
import Layout from "../../components/layout/Layout";
import Button from "../../components/atoms/button/Button";
import Spinner from "../../components/atoms/spinner/Spinner";

import closePtBrowser from "../../services/closePtBrowser";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
import openFurther from "../../services/openFurther";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import stopTourAutostart from "../../services/stopTourAutostart";

import { runningOnWebRenderer } from "../../helpers/utils";

export type Props = {
  furtherUrl: string
  pythonDocsUrl: string;
};

export default ({ furtherUrl, pythonDocsUrl  }: Props) => {
  const kbUrl = "https://knowledgebase.pi-top.com";
  const [isOpeningPythonDocs, setIsOpeningPythonDocs] = useState(false);
  const [isOpeningFurther, setIsOpeningFurther] = useState(false);
  const [isOpeningKnowledgeBase, setIsOpeningKnowledgeBase] = useState(false);

  const goToFurther = () => {
    if (runningOnWebRenderer()) {
      openFurther();
      setIsOpeningFurther(true);
      window.setTimeout(() => setIsOpeningFurther(false), 10000);
    } else {
      window.open(furtherUrl);
    }
  }
  const goToPythonSDKDocs = () => {
    if (runningOnWebRenderer()) {
      openPythonSDKDocs();
      setIsOpeningPythonDocs(true);
      window.setTimeout(() => setIsOpeningPythonDocs(false), 10000);
    } else {
      window.open(pythonDocsUrl);
    }
  }
  const goToKB = () => {
    if (runningOnWebRenderer()) {
      openKnowledgeBase();
      setIsOpeningKnowledgeBase(true);
      window.setTimeout(() => setIsOpeningKnowledgeBase(false), 10000);
    } else {
      window.open(kbUrl);
    }
  }

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
        hidden: ! runningOnWebRenderer()
      }}
      className={styles.root}
    >
      <div className={styles.buttonContainer}>
        <Button
          className={styles.linkButton}
          unstyled
          disabled={isOpeningFurther}
          onClick={() => goToFurther()}>
          Go Further
        </Button>
        <span className={styles.spinnerSpan}>{isOpeningFurther && <Spinner size={25} />}</span>
      </div>

      <div className={styles.buttonContainer}>
        <Button
          className={styles.linkButton}
          unstyled
          disabled={isOpeningPythonDocs}
          onClick={() => goToPythonSDKDocs()}>
          Checkout the Python SDK
        </Button>
        <span className={styles.spinnerSpan}>{isOpeningPythonDocs && <Spinner size={25} />}</span>
      </div>

      <div className={styles.buttonContainer}>
        <Button
          className={styles.linkButton}
          unstyled
          disabled={isOpeningKnowledgeBase}
          onClick={() => goToKB()}>
          Go to the Knowledge Base
        </Button>
        <span className={styles.spinnerSpan}>{isOpeningKnowledgeBase && <Spinner size={25} />}</span>
      </div>

    </Layout>
  );
};
