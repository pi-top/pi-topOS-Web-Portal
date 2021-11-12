import React from "react";

import Layout from "../../components/layout/Layout";

import keyboardScreen from "../../assets/images/keyboard-screen.png";
import styles from "./KnowledgeBasePage.module.css";



export default () => {
  return (
    <Layout
      banner={{
        src: keyboardScreen,
        alt: "kb-screen-banner"
      }}
      prompt={
        <>
          Knowledge{" "}
          <span className="green">Base</span>
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
        Questions?
      </div>
    </Layout>
  );
};
