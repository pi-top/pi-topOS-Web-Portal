import React from "react";

import summaryScreen from "../../assets/images/summary-screen.png";
import styles from "./SplashPage.module.css";
import Layout from "../../components/layout/Layout";

export type Props = {
  goToNextPage: () => void;
};

export default ({ goToNextPage }: Props) => {
  return (
    <Layout
      banner={{
        src: summaryScreen,
        alt: "intro-screen"
      }}
      prompt={
        <>
          All done, now let's start <span className="green">making</span>!
        </>
      }
      nextButton={{
        onClick: goToNextPage,
        label: "Let's Go"
      }}
      className={styles.root}
    />
  );
};
