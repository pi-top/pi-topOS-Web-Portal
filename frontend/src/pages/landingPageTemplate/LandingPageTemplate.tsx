import React, { useEffect, useState } from "react";

import { LandingPageElement } from "../../components/landing_app/App";

import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import styles from "./LandingPageTemplate.module.css";
import { runningOnWebRenderer } from "../../helpers/utils";
import closePtOsLandingWindow from "../../services/closePtOsLandingWindow";

export type Props = LandingPageElement;

export default ({ ...props }: Props) => {
  const [isOpeningUrl, setIsOpeningUrl] = useState(false);
  const [url, setUrl] = useState<string>(props.urlInfo.defaultUrl);
  const [, setError] = useState(false);

  useEffect(() => {
    if (props.urlInfo.urlService) {
      props.urlInfo.urlService()
        .then((data: any) => setUrl(data.url))
        .catch(() => setUrl(props.urlInfo.defaultUrl))
    }
  }, [props]);

  return (
    <Layout
      banner={{
        src: props.image,
        alt: "banner"
      }}
      prompt={props.prompt}
      nextButton={{
        onClick: () => {
          if (runningOnWebRenderer()) {
            setIsOpeningUrl(true);
            props.urlInfo.onWebRenderer()
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
        label: props.buttonLabel? props.buttonLabel : "Let's Go",
        disabled: isOpeningUrl,
      }}

      className={styles.root}
      showBack={false}
      showSkip={false}
      showHeader={false}
    >
      <div className={styles.message}>
        {props.message &&
          <span className={styles.message}>
          {
              props.message.split('\n').map((item, key) => {
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
