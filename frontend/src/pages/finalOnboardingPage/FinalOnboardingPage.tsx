import React from "react";

import Layout from "../../components/layout/Layout";

import rebootScreen from "../../assets/images/reboot-screen.png";
import styles from "./FinalOnboardingPage.module.css";

export const explanationMessage =
  "Press 'Finish' to complete the setup process";

export type Props = {
  onBackClick?: () => void;
  onNextClick?: () => void;
};

export default ({ onBackClick, onNextClick }: Props) => {
  return (
    <Layout
      banner={{
        src: rebootScreen,
        alt: "reboot-screen",
      }}
      prompt={
        <>
          Great, you're all set! <span className="green">Enjoy</span>!
        </>
      }
      explanation={explanationMessage}
      nextButton={{
        onClick: onNextClick,
        label: "Finish",
        disabled: false,
        hidden: false,
      }}
      backButton={{
        onClick: onBackClick,
        label: "Back",
        disabled: false,
        hidden: false,
      }}
      className={styles.root}
    ></Layout>
  );
};
