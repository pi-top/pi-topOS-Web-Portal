import React, { useState, useEffect } from "react";
import { Line as ProgressBar } from "rc-progress";

import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import rebootScreen from "../../assets/images/reboot-screen.png";
import styles from "./RestartPage.module.css";

import { runningOnWebRenderer } from "../../helpers/utils";
import ManualPowerOnDialogContainer from "./manualPowerOnDialog/ManualPowerOnDialogContainer";

export enum ErrorMessage {
  GlobalError = "Something went wrong while setting me up! Please click 'Restart' and contact support@pi-top.com if you experience any problems",
  RebootError = "I can't get to sleep! Please hold my power button down - that always makes me sleepy",
  TimeoutError = "It seems as though this is taking longer than expected. Try refreshing this webpage in your browser. Otherwise, try checking your connection and restarting your pi-top device."
}

export enum ServerStatusMessages {
  Waiting = "Rebooting. Please wait until this pi-top device is back online",
  Online = "The device is back online!"
}

export enum ExplanationMessages {
  OnWebRenderer = "Press 'restart' and I'll set some stuff up before rebooting. This might take up to a couple of minutes.",
  OnBrowser = "Press 'restart' to apply some final changes to your pi-top device and restart it.\n\nThis page will automatically update when the device is ready - this might take up to a couple of minutes, so don't go anywhere"
}

export type Props = {
  isWaitingForServer: boolean
  serverRebooted: boolean
  globalError: boolean;
  isSettingUpDevice: boolean;
  rebootError: boolean;
  progressPercentage: number;
  progressMessage: string;
  displayManualPowerOnDialog: boolean;
  onManualPowerOnDialogClose: () => void;
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
  displayManualPowerOnDialog,
  onManualPowerOnDialogClose,
  setupDevice,
  onBackClick,
}: Props) => {
  const [manualPowerOnDialogActive, setManualPowerOnDialogActive] = useState(false);

  useEffect(() => {
    setManualPowerOnDialogActive(displayManualPowerOnDialog);
  }, [displayManualPowerOnDialog])

  let errorMessage = "";
  if (globalError) {
    errorMessage = ErrorMessage.GlobalError;
  }

  if (rebootError) {
    errorMessage = isWaitingForServer ? ErrorMessage.TimeoutError : ErrorMessage.RebootError;
  }

  let explanationMessage = runningOnWebRenderer() ? ExplanationMessages.OnWebRenderer : ExplanationMessages.OnBrowser;

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
      explanation={explanationMessage}
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

      <ManualPowerOnDialogContainer
        active={manualPowerOnDialogActive}
        onClose={() => {
          setManualPowerOnDialogActive(!manualPowerOnDialogActive);
          onManualPowerOnDialogClose();
        }}
      />

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
