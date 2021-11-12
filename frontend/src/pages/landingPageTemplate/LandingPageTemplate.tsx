import React from "react";
import { LandingPageElement } from "../../components/landing_app/App";

import Layout from "../../components/layout/Layout";

import styles from "./LandingPageTemplate.module.css";


export type Props = {
  page: LandingPageElement;
};

export default ({ page }: Props) => {
  return (
    <Layout
      banner={{
        src: page.image,
        alt: "banner"
      }}
      prompt={page.prompt}
      nextButton={{
        onClick: () => page.onNextButtonClick(),
        label: "Let's Go",
      }}

      className={styles.root}
      showBack={false}
      showSkip={false}
      showHeader={false}
    >
      <div className={styles.message}>
        {page.message &&
          <span className={styles.message}>
          {
              page.message.split('\n').map((item, key) => {
                return <span key={key}>{item}<br/></span>
              })
          }
          </span>
        }
      </div>
    </Layout>
  );
};
