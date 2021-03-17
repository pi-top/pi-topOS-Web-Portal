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
  Finish = "Great, system update has been successfully installed!",
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
  downloadSize: number,
  error: boolean
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
  downloadSize,
  error,
}: Props) => {
  const errorMessage = error && ErrorMessage.GenericError;

  const getExplanation = () => {
    if (error) {
      return ""
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
          disabled: !upgradeIsPrepared || upgradeIsRunning || error
        }}
        skipButton={{ onClick: onSkipClick }}
        showSkip={isCompleted || error}
        backButton={{
          onClick: onBackClick,
          disabled: upgradeIsRunning
        }}
      >
        {!(upgradeIsPrepared || error) && (
          <>
            <Spinner size={40} />{" "}
          </>
        )}
        {message?.type === OSUpdaterMessageType.Upgrade && (
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
