import React from "react";

import Layout from "../../components/layout/Layout";

import introScreen from "../../assets/images/intro-screen.png";
import styles from "./FurtherPage.module.css";



export default () => {
  return (
    <Layout
      banner={{
        src: introScreen,
        alt: "further-screen-banner"
      }}
      prompt={
        <>
          Learn by making on{" "}
          <span className="green">Further :)</span>
        </>
      }
      nextButton={{
        onClick: () => {},
        label: "Let's Go",
      }}

      className={styles.root}
      showBack={false}
      showSkip={false}
      showHeader={false}
    >
      <div className={styles.message}>
        A community of pi-top owners who like hands on learning.
        It's time to get you started and show you a bit about how Further works.
        Grab your pi-top and hit next to continue.
      </div>
    </Layout>
  );
};
