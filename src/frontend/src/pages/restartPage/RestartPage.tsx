import React from "react";
import { Line as ProgressBar } from "rc-progress";

import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import rebootScreen from "../../assets/images/reboot-screen.png";
import styles from "./RestartPage.module.css";

export enum ErrorMessage {
  GlobalError = "Something went wrong while setting me up! Please click 'Restart' and contact support@pi-top.com if you experience any problems",
  RebootError = "I can't get to sleep! Please hold my power button down - that always makes me sleepy"
}

export enum ServerStatusMessages {
  Waiting = "Rebooting device, please wait until the unit is back online...",
  Online = "The device is back online!"
}

export type Props = {
  isWaitingForServer: boolean
  serverRebooted: boolean
  globalError: boolean;
  isSettingUpDevice: boolean;
  rebootError: boolean;
  progressPercentage: number;
  progressMessage: string;
  setupDevice: () => void;
  onBackClick?: () => void;
};

export default ({
  isWaitingForServer,
  serverRebooted,
  globalError,
  isSettingUpDevice,
  rebootError,
  progressPercentage,
  progressMessage,
  setupDevice,
  onBackClick,
}: Props) => {
  let errorMessage = "";
  if (globalError) {
    errorMessage = ErrorMessage.GlobalError;
  }

  if (rebootError) {
    errorMessage = ErrorMessage.RebootError;
  }

  return (
    <Layout
      banner={{
        src: rebootScreen,
        alt: "reboot-screen",
      }}
      prompt={
        <>
          Right, I need a quick <span className="green">nap</span>
        </>
      }
      explanation="Press restart and I'll set some stuff up before rebooting"
      nextButton={{
        onClick: setupDevice,
        label: "Restart",
        disabled: isSettingUpDevice || rebootError || isWaitingForServer,
        hidden: isWaitingForServer || serverRebooted
      }}
      backButton={
        (globalError || !onBackClick)
          ? undefined
          : {
              onClick: onBackClick,
              disabled: isSettingUpDevice || isWaitingForServer,
              hidden: isWaitingForServer || serverRebooted
            }
      }
      className={styles.root}
    >
      {isSettingUpDevice && (
        <div className={styles.progress}>
          <ProgressBar
            percent={progressPercentage}
            strokeWidth={2}
            strokeColor="#71c0b4"
          />
          <span className={styles.message}>{progressMessage}</span>
        </div>
      )}
      {isWaitingForServer ? (
        <>
          <span className={styles.message}>{ServerStatusMessages.Waiting}</span>
          <Spinner size={40} />{" "}
        </>
      ):(
        serverRebooted && <span className={styles.message}>{ServerStatusMessages.Online}</span>
      )}

      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
