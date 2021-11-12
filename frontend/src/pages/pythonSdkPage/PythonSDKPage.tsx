import React from "react";

import Layout from "../../components/layout/Layout";

import registrationScreen from "../../assets/images/registration-screen.png";
import styles from "./PythonSDKPage.module.css";



export default () => {
  return (
    <Layout
      banner={{
        src: registrationScreen,
        alt: "registration-screen-banner"
      }}
      prompt={
        <>
          Checkout the Python{" "}
          <span className="green">SDK</span>
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
        The Software Development Kit (SDK) provides an easy-to-use framework to interact with your pi-top using python.
        It also contains CLI utilities to manage your pi-top using the terminal.
        <br></br>
        Press the "Let's Go" button to open its documentation and start making!
      </div>
    </Layout>
  );
};
