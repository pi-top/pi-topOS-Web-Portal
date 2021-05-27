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
  const [isOpeningLink, setIsOpeningLink] = useState(false);

  const serviceMap = new Map<string, any>();
  serviceMap.set(kbUrl, {"callback": openKnowledgeBase});
  serviceMap.set(forumUrl, {"callback": openForum});
  serviceMap.set(furtherUrl, {"callback": openFurther});
  serviceMap.set(pythonDocsUrl, {"callback": openPythonSDKDocs});

  const openLinkInDevice = (link: string) => {
    if (serviceMap.has(link)) {
      setIsOpeningLink(true);
      serviceMap.get(link).callback();
      window.setTimeout(() => {
        setIsOpeningLink(false);
        closePtBrowser();
      }, 10000);
    }
  }

  const openLink = (link: string) => {
    runningOnWebRenderer() ? openLinkInDevice(link) : window.open(link);
  }

  return (
    <TourLayout
      isLoadingBanner={isOpeningLink}
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
          openLink(furtherUrl);
          runningOnWebRenderer() && stopTourAutostart()
          },
        label: 'Go to Further',
        disabled: isOpeningLink,
        className: styles.furtherButton
      }}
      className={styles.root}
    >
      <span className={styles.message}>
        If you know what you want to make, checkout our <Button className={styles.linkButton} unstyled disabled={isOpeningLink} onClick={() => openLink(pythonDocsUrl)}> Python SDK</Button>.
      </span>
      <span className={styles.message}>
        Have some questions? Go to <Button className={styles.linkButton} unstyled disabled={isOpeningLink} onClick={() => openLink(kbUrl)}> Knowledge Base </Button> or connect with our community on our   <Button className={styles.linkButton} unstyled disabled={isOpeningLink} onClick={() => openLink(forumUrl)}> Forum </Button>
      </span>

    </TourLayout>
  );
};
