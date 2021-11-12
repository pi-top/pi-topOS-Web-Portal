import React from "react";

import Layout from "../../components/layout/Layout";

import upgradePage from "../../assets/images/upgrade-page.png";
import styles from "./RoverPage.module.css";



export default () => {
  return (
    <Layout
      banner={{
        src: upgradePage,
        alt: "rover-screen-banner"
      }}
      prompt={
        <>
          Rover{" "}
          <span className="green">Controller</span>
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
        Take adventures with your very own pi-top[4] Mars rover!
      </div>
    </Layout>
  );
};
