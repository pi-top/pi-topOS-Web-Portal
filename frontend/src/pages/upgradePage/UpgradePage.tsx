import React, { useState, useEffect } from "react";
import { Line as ProgressBar } from "rc-progress";
import prettyBytes from "pretty-bytes";

import CheckBox from "../../components/atoms/checkBox/CheckBox";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/atoms/spinner/Spinner";

import upgradePage from "../../assets/images/upgrade-page.png";
import styles from "./UpgradePage.module.css";

import { ErrorType, OSUpdaterMessage, OSUpdaterMessageType, UpdateMessageStatus, UpdateState } from "./UpgradePageContainer"
import NewOsVersionDialogContainer from "./newOsVersionDialog/NewOsVersionDialogContainer";
import UpgradeHistoryTextArea from "../../components/upgradeHistoryTextArea/UpgradeHistoryTextArea";
import { runningOnWebRenderer } from "../../helpers/utils";

export enum ErrorMessage {
  NoSpaceAvailable = "There's not enough space on the device to install updates. Please, free up space and try updating again.",
  GenericError = "There was a problem during system update.\nIf this is the first time, please try again using the recommended method.\nIf you're experiencing repeated issues, try another method.",
  CloseOtherWindow = "The OS Updater application is already running in another window.",
}

export enum UpgradePageExplanation {
  UpgradePreparedWithDownload = "{size} of new packages need to be installed. This might take {time} minutes.",
  UpgradePreparedWithoutDownload = "Some packages need to be installed. This might take a few minutes.",
  InProgress = "Now sit back and relax - this may take some time...\nPlease, DO NOT POWER OFF YOUR DEVICE!",
  FinishStandaloneUpdaterAppOnWebBrowser = "Great, system update has been successfully installed!\n\nYou can now close this window.",
  Finish = "Great, system update has been successfully installed!\n\nPlease click the {continueButtonLabel} button to {continueButtonAction}.",
  WaitingForServer = "Please wait...",
  UpdatingSources = "Checking to see if there are updates available...",
  Preparing = "Preparing all packages to be updated...",
  PreparingWebPortal = "Preparing to update myself...",
  UpdatingWebPortal = "I'm updating myself, please wait...",
}


export type Props = {
  onNextClick?: () => void;
  onSkipClick?: () => void;
  onBackClick?: () => void;
  onStartUpgradeClick: () => void;
  onRetry: (defaultBackend: boolean) => void;
  isCompleted?: boolean;
  message?: OSUpdaterMessage,
  updateState: UpdateState,
  downloadSize: number,
  error: ErrorType,
  requireBurn: boolean,
  hideSkip?: boolean,
  shouldBurn: boolean,
};

export default ({
  onSkipClick,
  onBackClick,
  onNextClick,
  onStartUpgradeClick,
  onRetry,
  updateState,
  isCompleted,
  message,
  downloadSize,
  requireBurn,
  shouldBurn,
  hideSkip,
  error,
}: Props) => {
  const [isNewOsDialogActive, setIsNewOsDialogActive] = useState(false);
  const [isUsingDefaultBackend, setIsUsingDefaultBackend] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setIsNewOsDialogActive(requireBurn || shouldBurn);
  }, [requireBurn, shouldBurn]);

  const hasError = () => {
    return error !== ErrorType.None
  }

  const getErrorMessage = () => {
    switch (error) {
      case ErrorType.NoSpaceAvailable:
        return ErrorMessage.NoSpaceAvailable;
      case ErrorType.UpdaterAlreadyRunning:
        return ErrorMessage.CloseOtherWindow;
      default:
        return ErrorMessage.GenericError
    }
  }

  const getPromptMessage = () => {
    if (updateState === UpdateState.Finished) {
      return <>Your system is <span className="green">up to date</span>!</>
    } else if (isRetrying) {
      return <>OK, let's try <span className="green">updating</span> again!</>
    }
    return <>OK, I need to be <span className="green">updated</span></>
  }

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

    switch (updateState) {
      case UpdateState.UpdatingSources:
        return UpgradePageExplanation.UpdatingSources;
      case UpdateState.PreparingWebPortal:
        return UpgradePageExplanation.PreparingWebPortal;
      case UpdateState.UpgradingWebPortal:
        return UpgradePageExplanation.UpdatingWebPortal;
      case UpdateState.WaitingForServer:
        return UpgradePageExplanation.WaitingForServer;
      case UpdateState.PreparingSystemUpgrade:
        return UpgradePageExplanation.Preparing;
      case UpdateState.UpgradingSystem:
        return UpgradePageExplanation.InProgress;
      case UpdateState.WaitingForUserInput:
        if (downloadSize) {
          return UpgradePageExplanation.UpgradePreparedWithDownload
            .replace("{size}", prettyBytes(downloadSize))
            .replace("{time}", "a few");
        }
        return UpgradePageExplanation.UpgradePreparedWithoutDownload;
      case UpdateState.Finished:
        if (runsUpdaterStandaloneAppInBrowser) {
          return UpgradePageExplanation.FinishStandaloneUpdaterAppOnWebBrowser
        }
        return UpgradePageExplanation.Finish.replace(
          "{continueButtonLabel}",
          continueButtonLabel
        ).replace("{continueButtonAction}", onBackClick? "continue" : "finish");
      default:
        return ""
    };
  };

  const continueButtonLabel = hasError() ? "Retry" : updateState !== UpdateState.Finished ? "Update" : onBackClick? "Next" : "Exit";
  const nextButtonDisabledStates = [UpdateState.WaitingForServer, UpdateState.None, UpdateState.UpdatingSources, UpdateState.PreparingSystemUpgrade, UpdateState.PreparingWebPortal, UpdateState.UpgradingSystem, UpdateState.UpgradingWebPortal, UpdateState.Connect, UpdateState.Reattaching];
  const backButtonDisabledStates = [UpdateState.UpdatingSources, UpdateState.UpgradingSystem, UpdateState.UpgradingWebPortal, UpdateState.Connect, UpdateState.Reattaching, UpdateState.PreparingWebPortal];
  const showBackButtonStates = [UpdateState.Error, UpdateState.WaitingForUserInput, UpdateState.Finished];
  const runsUpdaterStandaloneAppInBrowser = !runningOnWebRenderer() && onBackClick === undefined;

  const onNextButtonClick = () => {
    if (hasError()) {
        setIsRetrying(true);
        onRetry(isUsingDefaultBackend)
    } else if (updateState === UpdateState.WaitingForUserInput) {
      onStartUpgradeClick();
    } else {
      onNextClick && onNextClick();
    }
  }

  return (
    <>
      <Layout
        banner={{
          src: upgradePage,
          alt: "upgrade-page-banner",
        }}
        prompt={getPromptMessage()}
        explanation={getExplanation()}
        nextButton={{
          onClick: onNextButtonClick,
          label: continueButtonLabel,
          disabled: !hasError() && nextButtonDisabledStates.includes(updateState),
          hidden: error === ErrorType.UpdaterAlreadyRunning || (updateState === UpdateState.Finished && runsUpdaterStandaloneAppInBrowser)
        }}
        skipButton={{ onClick: onSkipClick }}
        showSkip={!hideSkip && onSkipClick !== undefined && (hasError() || isCompleted === true)}
        showBack={onBackClick !== undefined && (hasError() || showBackButtonStates.includes(updateState))}
        backButton={{
          onClick: onBackClick,
          disabled: !hasError() && backButtonDisabledStates.includes(updateState)
        }}
      >
        { hasError() && (
          <>
          <span className={styles.error}>
            {
              getErrorMessage().split('\n').map(function(item, key) {
                return (<span key={key}>{item}<br/></span>)
              })
            }
          </span>

          { error !== ErrorType.UpdaterAlreadyRunning &&
            <CheckBox
              name="legacy-backend"
              label="Use alternate update method"
              checked={!isUsingDefaultBackend}
              onChange={() => setIsUsingDefaultBackend(!isUsingDefaultBackend)}
              className={styles.checkbox}
            />
          }
          </>
        )}

        <NewOsVersionDialogContainer
          active={isNewOsDialogActive}
          requireBurn={requireBurn}
          shouldBurn={shouldBurn}
          onClose={() => setIsNewOsDialogActive(false)}
        />

        { updateState !== UpdateState.WaitingForServer && message && message?.type === OSUpdaterMessageType.Upgrade &&
          <UpgradeHistoryTextArea message={parseMessage(message)} />
        }

        { updateState !== UpdateState.WaitingForServer && message && message?.type === OSUpdaterMessageType.UpdateSources &&
          <UpgradeHistoryTextArea message={parseMessage(message)} />
        }

        { !hasError() && (updateState === UpdateState.WaitingForServer || updateState === UpdateState.Reattaching ) && (
          <>
            <Spinner size={40} />{" "}
          </>
        )}

        {(message?.type === OSUpdaterMessageType.Upgrade || message?.type === OSUpdaterMessageType.UpdateSources)
          && updateState !== UpdateState.WaitingForServer
          && !hasError()
          && isUsingDefaultBackend
          && (
            <div data-testid="progress" className={styles.progress}>
              <ProgressBar
                percent={message.payload.percent}
                strokeWidth={2}
                strokeColor="#71c0b4"
              />
            </div>
          )
        }
      </Layout>
    </>
  );
};
