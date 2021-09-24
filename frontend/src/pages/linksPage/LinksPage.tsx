import React, { useState, useEffect } from "react";

import linkScreenCenter from "../../assets/images/tour-links-screen.svg";

import styles from "./LinksPage.module.css";
import TourLayout  from "../../components/tourLayout/TourLayout";
import Button from "../../components/atoms/button/Button";

import closePtBrowser from "../../services/closePtBrowser";
import openPythonSDKDocs from "../../services/openPythonSDKDocs";
// import openFurther from "../../services/openFurther";
import openKnowledgeBase from "../../services/openKnowledgeBase";
import openForum from "../../services/openForum";
import stopTourAutostart from "../../services/stopTourAutostart";
import getPythonSDKDocsUrl from "../../services/getPythonSDKDocsUrl";
// import getFurtherUrl from "../../services/getFurtherUrl";

import { runningOnWebRenderer } from "../../helpers/utils";


export default () => {
  const kbUrl = "https://knowledgebase.pi-top.com";
  const forumUrl = "https://forum.pi-top.com";
  const [pythonDocsUrl, setPythonDocsUrl] = useState("https://docs.pi-top.com");
  // const [furtherUrl, setFurtherUrl] = useState("https://further.pi-top.com/start");
  const [isOpeningLink, setIsOpeningLink] = useState(false);

  const serviceMap = new Map<string, any>();
  serviceMap.set(kbUrl, {"callback": openKnowledgeBase});
  serviceMap.set(forumUrl, {"callback": openForum});
  // serviceMap.set(furtherUrl, {"callback": openFurther});
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

  const updateSDKUrl = () => {
    getPythonSDKDocsUrl()
      .then((url_data) => {
        if (runningOnWebRenderer() || url_data.url.startsWith("http")) {
            setPythonDocsUrl(url_data.url);
        }
      })
      .catch(() => null) // will use default url
  };

  // const updateFurtherUrl = () => {
    // getFurtherUrl()
    //   .then((url_data) => setFurtherUrl(url_data.url))
    //   .catch(() => null) // will use default url
  // };

  useEffect(() => {
    Promise.all([updateSDKUrl()/*, updateFurtherUrl()*/]);
  }, []);

  return (
    <TourLayout
      onCloseButton={() => !isOpeningLink && stopTourAutostart().then(() => closePtBrowser())}
      isLoadingBanner={isOpeningLink}
      banner={{
        src: linkScreenCenter,
        alt: "links-screen-banner"
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
          // openLink(furtherUrl);
          stopTourAutostart()
          },
        label: 'Go to Further',
        disabled: isOpeningLink,
        className: styles.furtherButton
      }}
      className={styles.root}
    >
      <div className={styles.message}>
        <p>If you know what you want to make, checkout our <Button className={styles.linkButton} unstyled disabled={isOpeningLink} onClick={() => openLink(pythonDocsUrl)}> Python SDK</Button>.</p>
        <p>Have some questions? Go to <Button className={styles.linkButton} unstyled disabled={isOpeningLink} onClick={() => openLink(kbUrl)}> Knowledge Base </Button> or connect with our community on our   <Button className={styles.linkButton} unstyled disabled={isOpeningLink} onClick={() => openLink(forumUrl)}> Forum </Button></p>
      </div>

    </TourLayout>
  );
};
