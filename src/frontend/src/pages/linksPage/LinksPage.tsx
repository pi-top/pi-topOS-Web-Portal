import React, { useState } from "react";

import linkScreenCenter from "../../assets/images/tour-links-screen.svg";
import linkScreenSquare from "../../assets/images/tour-links-square.svg";

import styles from "./LinksPage.module.css";
import TourLayout  from "../../components/tourLayout/TourLayout";
import Button from "../../components/atoms/button/Button";

import closePtBrowser from "../../services/closePtBrowser";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
import openFurther from "../../services/openFurther";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import openForum from "../../services/openForum";
import stopTourAutostart from "../../services/stopTourAutostart";

import { runningOnWebRenderer } from "../../helpers/utils";

export type Props = {
  furtherUrl: string
  pythonDocsUrl: string;
};

export default ({ furtherUrl, pythonDocsUrl  }: Props) => {
  const kbUrl = "https://knowledgebase.pi-top.com";
  const forumUrl = "https://forum.pi-top.com";
  const [isOpeningPythonDocs, setIsOpeningPythonDocs] = useState(false);
  const [isOpeningFurther, setIsOpeningFurther] = useState(false);
  const [isOpeningKnowledgeBase, setIsOpeningKnowledgeBase] = useState(false);
  const [isOpeningForum, setIsOpeningForum] = useState(false);
  console.log(isOpeningForum);
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
  const goToForum = () => {
    if (runningOnWebRenderer()) {
      openForum();
      setIsOpeningForum(true);
      window.setTimeout(() => setIsOpeningForum(false), 10000);
    } else {
      window.open(forumUrl);
    }
  }

  return (
    <TourLayout
      isLoadingBanner={isOpeningFurther}
      banner={{
        src_banner: linkScreenCenter,
        alt_banner: "links-screen-banner"
      }}
      bannerCover={{
        src_cover: linkScreenSquare,
        alt_cover: "links-screen-square"
      }}
      prompt={
        <>What do you want to <span className="green">do next</span>?</>
      }
      title={
        <>Start <span className={styles.bold}>learning</span></>
      }
      explanation={
        <>Find coding challenges covering python, robotics, AI and more at Further, our <span className={styles.bold}>fun learning platform</span></>
      }
      nextButton={{
        onClick: () => {
          goToFurther();
          runningOnWebRenderer() && stopTourAutostart().then(() => window.setTimeout(closePtBrowser, 8000))
          },
        label: 'Go to Further',
        disabled: isOpeningFurther,
        className: styles.furtherButton
      }}
      className={styles.root}
    >
      <span className={styles.message}>
        If you know what you want to make, checkout our <Button className={styles.linkButton} unstyled disabled={isOpeningPythonDocs} onClick={() => goToPythonSDKDocs()}> Python SDK</Button>.
      </span>
      <span className={styles.message}>
        Have some questions? Go to <Button className={styles.linkButton} unstyled disabled={isOpeningKnowledgeBase} onClick={() => goToKB()}> Knowledge Base </Button> or connect with our community on our   <Button className={styles.linkButton} unstyled disabled={isOpeningKnowledgeBase} onClick={() => goToForum()}> Forum </Button>
      </span>
    </TourLayout>
  );
};
