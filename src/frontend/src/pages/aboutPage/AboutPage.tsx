import React from "react";

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
      prompt={
        isFetchingData && <>
          <Spinner size={50} />
        </>
      }
      explanation=""
      nextButton={{
        onClick: () => {},
        label: '',
        hidden: true
      }}
      className={styles.root}
    >
      {isFetchingData ?
        (<span className={styles.dataContent}>Retrieving device information...</span>)
      : (
        <div className={styles.divTable}>
          <div className={styles.divTableBody}>
            {
              Object.keys(deviceData).map(key => (
                <>
                <div className={styles.divTableRow}>
                  <div className={styles.divTableCell}>
                    <span className={styles.dataTitle}>{toTitleCase(key.replace("_", " "))}</span>
                  </div>
                  <div className={styles.divTableCell}>
                    <span className={styles.dataContent}>{deviceData[key]}</span>
                  </div>
                </div>
                </>
              ))
            }
          </div>
        </div>
        )
      }

      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
