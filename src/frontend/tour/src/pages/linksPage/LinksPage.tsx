import React from "react";

import linkScreen from "../../assets/images/upgrade-page.png";
import styles from "./LinksPage.module.css";
import Layout from "../../components/layout/Layout";
import Button from "../../components/atoms/button/Button";

export type Props = {
  goToNextPage: () => void;
};

export default ({ goToNextPage }: Props) => {
const furtherUrl = "https://further.pi-top.com";
const docsUrl = "https://docs.pi-top.com";
const kbUrl = "https://knowledgebase.pi-top.com";

  return (
    <Layout
      banner={{
        src: linkScreen,
        alt: "links-screen-banner"
      }}
      prompt={
        <>
          What do you want to <span className="green">do</span>?
        </>
      }
      explanation=""
      nextButton={{
        onClick: ()=>{ window.opener=null; window.close()},
        label: 'Exit'
      }}
      className={styles.root}
    >
      <Button className={styles.linkButton} unstyled onClick={() => window.open(furtherUrl)}>
        Go Further
      </Button>
      <Button className={styles.linkButton} unstyled onClick={() => window.open(docsUrl)}>
        Checkout the Python SDK
      </Button>
      <Button className={styles.linkButton} unstyled onClick={() => window.open(kbUrl)}>
        Go to the Knowledge Base
      </Button>
    </Layout>
  );
};
