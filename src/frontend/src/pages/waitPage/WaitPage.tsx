import React from "react";

import styles from "./WaitPage.module.css";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

export type Props = {
  hasError: boolean,
  isCheckingFsStatus: boolean,
  isExpandingFs: boolean,
  isRebooting: boolean
};

export enum ExplanationMessage {
  CheckingFsStatus = "",
  ExpandingFs = "",
  Rebooting = "Rebooting",
  Default = ""
}

export enum ErrorMessage {
  GenericError = "There was an issue, please turn your device off and back on.",
}

export default ({ isCheckingFsStatus, isExpandingFs, isRebooting, hasError }: Props) => {
  const errorMessage = hasError && ErrorMessage.GenericError;
  const getExplanation = () => {
    if (isRebooting) {
      return ExplanationMessage.Rebooting;
    }
    if (isExpandingFs) {
      return ExplanationMessage.ExpandingFs;
    }
    if (isCheckingFsStatus) {
      return ExplanationMessage.CheckingFsStatus;
    }
    return ExplanationMessage.Default;
  }
  return (
    <Layout
      banner={{
        src: "",
        alt: "wait-screen"
      }}
      prompt={
        (isExpandingFs || isRebooting) && <>
          <Spinner size={50} />
        </>
      }
      explanation={getExplanation()}
      nextButton={{
        onClick: () => {},
        label: '',
        hidden: true
      }}
      className={styles.root}
    >
      {isExpandingFs &&
      <>
        <p>Getting everything ready... 👷‍♂️</p>
        <h1 className={styles.title}>Please <span className="green">do not power off</span> or unplug your device! ⚠️</h1>
        <p>This may take a few minutes... ⏱</p>
        <p className={styles.greenTitle}>[ Your device may reboot multiple times during setup ]</p>
      </>}
      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
