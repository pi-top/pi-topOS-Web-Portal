import React from "react";
import cx from 'classnames';

import styles from "./AboutPage.module.css";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import piTopLogo from "../../assets/images/pi-top-logo.png";

export type Props = {
  hasError: boolean,
  isFetchingData: boolean,
  deviceData: any,
};

export enum ErrorMessage {
  GenericError = "There was an issue retrieving device information.",
}

const toTitleCase = (str: string) => str.replace(/\b\S/g, t => t.toUpperCase());

export default ({ deviceData, isFetchingData, hasError }: Props) => {
  const errorMessage = hasError && ErrorMessage.GenericError;

  return (
    <Layout
      banner={{
        src: piTopLogo,
        alt: "about-screen"
      }}
      prompt={"pi-topOS"}
      explanation=""
      nextButton={{
        onClick: () => {},
        label: '',
        hidden: true
      }}
      className={styles.root}
    >
      {isFetchingData ?
        (<>
          <Spinner size={50} />
        </>
        )
      : (
        <div className={styles.divTable}>
          <div className={styles.divTableBody}>
            {
              Object.keys(deviceData).map(key => {
                return <div key={key} className={styles.divTableRow}>
                  <div className={cx(styles.divTableCell, styles.alignRight)}>
                    <span className={styles.dataTitle}>{toTitleCase(key.replace("_", " "))}</span>
                  </div>
                  <div className={cx(styles.divTableCell, styles.alignLeft)}>
                    <span className={styles.dataContent}>{deviceData[key]}</span>
                  </div>
                </div>
              })
            }
          </div>
        </div>
        )
      }

      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
