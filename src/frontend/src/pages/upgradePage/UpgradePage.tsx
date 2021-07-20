import React from "react";
import { Line as ProgressBar } from "rc-progress";
import prettyBytes from "pretty-bytes";

import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import upgradePage from "../../assets/images/upgrade-page.png";
import styles from "./UpgradePage.module.css";

import { OSUpdaterMessage, OSUpdaterMessageType } from "./UpgradePageContainer"

export enum ErrorMessage {
  GenericError = "There was a problem during system update. Please skip - you should be able to update later.",
}

export enum UpgradePageExplanation {
  Preparing = "Checking the size of update...",
  UpgradePrepared = "{size} of new packages need to be installed. This might take {time} minutes.",
  InProgress = "Please sit back and relax - this may take some time...",
  Finish = "Great, system update has been successfully installed!\n\nPlease click the Next button to restart the application and continue.",
  WaitingForServer = "Please wait...",
}

export enum OsBurnExplanation {
  ShouldBurn = "There are major OS updates available, so the update process might take a while.",
  RequiredBurn = "This OS version is out of date and not maintained anymore.",
  ShouldBurnRecommendation = "We recommend you to download the latest version of pi-topOS from pi-top.com",
  RequiredBurnRecommendation = "Please, download the latest version of pi-topOS in pi-top.com",
}

export type Props = {
  onNextClick: () => void;
  onSkipClick: () => void;
  onBackClick: () => void;
  onStartUpgradeClick: () => void;
  isCompleted: boolean;
  message?: OSUpdaterMessage,
  upgradeIsPrepared: boolean,
  upgradeIsRequired: boolean,
  upgradeIsRunning: boolean,
  upgradeFinished: boolean,
  waitingForServer: boolean,
  downloadSize: number,
  error: boolean,
  requiredBurn: boolean,
  shouldBurn: boolean,
  standalone: boolean
};

export default ({
  onSkipClick,
  onBackClick,
  onNextClick,
  onStartUpgradeClick,
  isCompleted,
  message,
  upgradeIsPrepared,
  upgradeIsRequired,
  upgradeIsRunning,
  upgradeFinished,
  downloadSize,
  waitingForServer,
  requiredBurn,
  shouldBurn,
  error,
  standalone,
}: Props) => {
  const errorMessage = error && ErrorMessage.GenericError;

  const majorUpdatesAvailable = requiredBurn || shouldBurn;
  const getExplanation = () => {
    if (error) {
      return ""
    }
    if (waitingForServer) {
      return UpgradePageExplanation.WaitingForServer;
    }
    if (upgradeFinished) {
      return UpgradePageExplanation.Finish;
    }
    if (!upgradeIsRequired) {
      return UpgradePageExplanation.Finish;
    }
    if (upgradeIsRunning) {
      return UpgradePageExplanation.InProgress;
    }
    if (upgradeIsPrepared) {
      return UpgradePageExplanation.UpgradePrepared.replace(
        "{size}",
        downloadSize ? prettyBytes(downloadSize) : "a few"
      ).replace("{time}", "a few");
    }
    return UpgradePageExplanation.Preparing;
  };

  return (
    <>
      <Layout
        banner={{
          src: upgradePage,
          alt: "upgrade-page-banner",
        }}
        prompt={
          <>
            OK, I need to be <span className="green">updated</span>
          </>
        }
        explanation={getExplanation()}
        nextButton={{
          onClick: upgradeIsRequired ? onStartUpgradeClick : onNextClick,
          label: !upgradeIsRequired ? "Next" : "Update",
          disabled: !upgradeIsPrepared || upgradeIsRunning || waitingForServer || error
        }}
        skipButton={{ onClick: onSkipClick }}
        showSkip={!standalone || isCompleted || error}
        showBack={!standalone}
        backButton={{
          onClick: onBackClick,
          disabled: upgradeIsRunning
        }}
      >

        {majorUpdatesAvailable && (
          <>
          <span className={styles.osUpgradeWarning}>
            {requiredBurn && OsBurnExplanation.RequiredBurn}
            {shouldBurn && !requiredBurn && OsBurnExplanation.ShouldBurn}
          </span>
          <span className={styles.osUpgradeWarning}>
            {requiredBurn && OsBurnExplanation.RequiredBurnRecommendation}
            {shouldBurn && !requiredBurn && OsBurnExplanation.ShouldBurnRecommendation}
          </span>
          </>
        )}


        { (waitingForServer || !(upgradeIsPrepared || error)) && (
          <>
            <Spinner size={40} />{" "}
          </>
        )}
        {message?.type === OSUpdaterMessageType.Upgrade && !waitingForServer && (
          <div className={styles.progress}>
            <ProgressBar
              percent={message.payload.percent}
              strokeWidth={2}
              strokeColor="#71c0b4"
            />
            <span className={styles.message}>{message.payload.message}</span>
          </div>
        )}

        {errorMessage && <span className={styles.error}>{errorMessage}</span>}
      </Layout>
    </>
  );
};
