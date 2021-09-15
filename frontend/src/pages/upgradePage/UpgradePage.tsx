import React, { useState, useEffect } from "react";
import { Line as ProgressBar } from "rc-progress";
import prettyBytes from "pretty-bytes";

import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import upgradePage from "../../assets/images/upgrade-page.png";
import styles from "./UpgradePage.module.css";

import { OSUpdaterMessage, OSUpdaterMessageType, UpdateMessageStatus } from "./UpgradePageContainer"
import NewOsVersionDialogContainer from "./newOsVersionDialog/NewOsVersionDialogContainer";
import UpgradeHistoryTextArea from "../../components/upgradeHistoryTextArea/UpgradeHistoryTextArea";

export enum ErrorMessage {
  GenericError = "There was a problem during system update. Please skip - you should be able to update later.",
}

export enum UpgradePageExplanation {
  UpgradePreparedWithDownload = "{size} of new packages need to be installed. This might take {time} minutes.",
  UpgradePreparedWithoutDownload = "Some packages need to be installed. This might take a few minutes.",
  InProgress = "Please sit back and relax - this may take some time...",
  Finish = "Great, system update has been successfully installed!\n\nPlease click the {continueButtonLabel} button to restart the application and {continueButtonAction}.",
  WaitingForServer = "Please wait...",
  UpdatingSources = "We're checking to see if there are updates available",
  Preparing = "Preparing all packages to be updated...",
  PreparingWebPortal = "Preparing to update myself...",
  UpdatingWebPortal = "I'm updating myself, please wait",
}


export type Props = {
  onNextClick?: () => void;
  onSkipClick?: () => void;
  onBackClick?: () => void;
  onStartUpgradeClick: () => void;
  isCompleted?: boolean;
  message?: OSUpdaterMessage,
  updatingSources: boolean,
  upgradeIsPrepared: boolean,
  upgradeIsRequired: boolean,
  upgradeIsRunning: boolean,
  upgradeFinished: boolean,
  waitingForServer: boolean,
  downloadSize: number,
  error: boolean,
  requireBurn: boolean,
  shouldBurn: boolean,
  checkingWebPortal: boolean,
  installingWebPortalUpgrade: boolean,
};

export default ({
  onSkipClick,
  onBackClick,
  onNextClick,
  onStartUpgradeClick,
  isCompleted,
  message,
  updatingSources,
  upgradeIsPrepared,
  upgradeIsRequired,
  upgradeIsRunning,
  upgradeFinished,
  downloadSize,
  waitingForServer,
  requireBurn,
  shouldBurn,
  checkingWebPortal,
  installingWebPortalUpgrade,
  error,
}: Props) => {
  const [isNewOsDialogActive, setIsNewOsDialogActive] = useState(false);

  useEffect(() => {
    setIsNewOsDialogActive(requireBurn || shouldBurn);
  }, [requireBurn, shouldBurn]);

  const errorMessage = error && ErrorMessage.GenericError;

  const parseMessage = (message: OSUpdaterMessage) => {
    if (message?.type === OSUpdaterMessageType.UpdateSources || message?.type === OSUpdaterMessageType.Upgrade || message?.type === OSUpdaterMessageType.PrepareUpgrade) {
      let msg = JSON.stringify(message.payload?.message).trim().replace(/^"(.*)"$/, '$1')
        .replace(/\\\\n/g, String.fromCharCode(10));
      if (message.payload.status === UpdateMessageStatus.Error) {
        // Add a newline before an ERROR message
        msg = String.fromCharCode(13, 10) + msg;
      }

      return msg
    }
    return ""
  }

  const getExplanation = () => {
    if (error) {
      return ""
    }
    if (waitingForServer) {
      return UpgradePageExplanation.WaitingForServer;
    }
    if (upgradeFinished) {
      return UpgradePageExplanation.Finish.replace(
        "{continueButtonLabel}",
        continueButtonLabel
      ).replace("{continueButtonAction}", onBackClick? "continue" : "finish");
    }
    if (!upgradeIsRequired) {
      return UpgradePageExplanation.Finish.replace(
        "{continueButtonLabel}",
        continueButtonLabel
      ).replace("{continueButtonAction}", onBackClick? "continue" : "finish");
    }
    if (upgradeIsRunning) {
      return UpgradePageExplanation.InProgress;
    }
    if (upgradeIsPrepared) {
      if (downloadSize) {
        return UpgradePageExplanation.UpgradePreparedWithDownload
          .replace("{size}", prettyBytes(downloadSize))
          .replace("{time}", "a few");
      }
      return UpgradePageExplanation.UpgradePreparedWithoutDownload
    }
    if (updatingSources) {
      return UpgradePageExplanation.UpdatingSources;
    }
    if (checkingWebPortal && !installingWebPortalUpgrade) {
      return UpgradePageExplanation.PreparingWebPortal;
    }
    if (checkingWebPortal && installingWebPortalUpgrade) {
      return UpgradePageExplanation.UpdatingWebPortal;
    }
    return UpgradePageExplanation.Preparing;
  };

  const continueButtonLabel = upgradeIsRequired ? "Update" : onBackClick? "Next" : "Exit"

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
          label: continueButtonLabel,
          disabled: !upgradeIsPrepared || upgradeIsRunning || waitingForServer || error
        }}
        skipButton={{ onClick: onSkipClick }}
        showSkip={onSkipClick !== undefined && (isCompleted || error)}
        showBack={onBackClick !== undefined && !upgradeIsRunning}
        backButton={{
          onClick: onBackClick,
          disabled: upgradeIsRunning
        }}
      >
        {errorMessage && <span className={styles.error}>{errorMessage}</span>}

        <NewOsVersionDialogContainer
          active={isNewOsDialogActive}
          requireBurn={requireBurn}
          shouldBurn={shouldBurn}
          onClose={() => setIsNewOsDialogActive(false)}
        />

        { !waitingForServer && message && message?.type === OSUpdaterMessageType.Upgrade &&
          <UpgradeHistoryTextArea message={parseMessage(message)} />
        }

        { !waitingForServer && message && message?.type === OSUpdaterMessageType.UpdateSources &&
          <UpgradeHistoryTextArea message={parseMessage(message)} />
        }

        { !error && waitingForServer && (
          <>
            <Spinner size={40} />{" "}
          </>
        )}

        {(message?.type === OSUpdaterMessageType.Upgrade || message?.type === OSUpdaterMessageType.UpdateSources) && !waitingForServer && !error && (
          <div data-testid="progress" className={styles.progress}>
            <ProgressBar
              percent={message.payload.percent}
              strokeWidth={2}
              strokeColor="#71c0b4"
            />
          </div>
        )}
      </Layout>
    </>
  );
};
