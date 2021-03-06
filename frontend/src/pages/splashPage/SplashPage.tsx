import React from "react";

import introScreen from "../../assets/images/intro-screen.png";
import styles from "./SplashPage.module.css";
import Layout from "../../components/layout/Layout";

import triggerReadyToBeAMakerEvent from "../../services/triggerReadyToBeAMakerEvent";

export type Props = {
  goToNextPage: () => void;
};

export default ({ goToNextPage }: Props) => {
  return (
    <Layout
      banner={{
        src: introScreen,
        alt: "intro-screen"
      }}
      prompt={
        <>
          Are you ready to be a <span className="green">maker</span>?
        </>
      }
      nextButton={{
        onClick: () => {
          triggerReadyToBeAMakerEvent()
            .catch(() => null)
            .then(goToNextPage)
        },
        label: 'Yes'
      }}
      className={styles.root}
    />
  );
};
