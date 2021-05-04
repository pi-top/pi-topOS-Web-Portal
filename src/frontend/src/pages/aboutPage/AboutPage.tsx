import React from "react";

import styles from "./AboutPage.module.css";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

export type Props = {
  hasError: boolean,
  isFetchingData: boolean,
  deviceData: object,
};

export enum ErrorMessage {
  GenericError = "There was an issue retrieving device information..",
}

export default ({ deviceData, isFetchingData, hasError }: Props) => {
  const errorMessage = hasError && ErrorMessage.GenericError;
  console.log(deviceData);
  return (
    <Layout
      banner={{
        src: "",
        alt: "wait-screen"
      }}
      prompt={
        isFetchingData  && <>
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
      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
