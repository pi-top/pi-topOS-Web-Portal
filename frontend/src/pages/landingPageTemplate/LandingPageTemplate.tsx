import React, { useEffect, useState } from "react";

import { LandingPageElement } from "../../components/landing_app/App";

import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import styles from "./LandingPageTemplate.module.css";
import { runningOnWebRenderer } from "../../helpers/utils";
import closePtOsLandingWindow from "../../services/closePtOsLandingWindow";

export type Props = {
  page: LandingPageElement;
};


export default ({ page }: Props) => {
  const [isOpeningUrl, setIsOpeningUrl] = useState(false);
  const [url, setUrl] = useState<string>(page.urlInfo.defaultUrl);
  const [, setError] = useState(false);

  useEffect(() => {
    if (page.urlInfo.urlService) {
      page.urlInfo.urlService()
        .then((data: any) => setUrl(data.url))
        .catch(() => setUrl(page.urlInfo.defaultUrl))
    }
  }, [page]);

  return (
    <Layout
      banner={{
        src: page.image,
        alt: "banner"
      }}
      prompt={page.prompt}
      nextButton={{
        onClick: () => {
          if (runningOnWebRenderer()) {
            setIsOpeningUrl(true);
            page.urlInfo.onWebRenderer()
              .then(() => {
                setIsOpeningUrl(true);
                window.setTimeout(() => {
                  setIsOpeningUrl(false);
                  closePtOsLandingWindow();
                }, 10000);
              })
              .catch(() => setError(true))
            ;
          } else {
            window.open(url)
          }
        },
        label: page.buttonLabel? page.buttonLabel : "Let's Go",
        disabled: isOpeningUrl,
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
        {isOpeningUrl && <Spinner size={45} />}
      </div>
    </Layout>
  );
};
