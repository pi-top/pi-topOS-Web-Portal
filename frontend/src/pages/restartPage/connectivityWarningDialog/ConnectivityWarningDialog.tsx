import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import Button from "../../../components/atoms/button/Button";

import styles from "./ConnectivityWarningDialog.module.css";

export type Props = {
  active: boolean;
  piTopIpAddress: string;
  shouldMoveAwayFromAp: boolean;
  onSkip: () => void;
  onContinue: () => void;
};

export const getMessage = (shouldMoveAwayFromAp: boolean) => {
  return (
    <>
      <span className={styles.dialogTitle}>{shouldMoveAwayFromAp ? "Reconnect to your Wi-Fi" : "Reconnect to the 'pi-top' network"} </span>
    </>
  );
};

export const getContent = (shouldMoveAwayFromAp: boolean) => {
  if (shouldMoveAwayFromAp) {
    return (
      <>
        Your pi-top is not connected to the same network as your device.
        <br></br>
        <br></br>
        This probably means that your computer is connected to the 'pi-top' network and your pi-top was configured to connect to your Wi-Fi network in one of the previous steps.
        <br></br>
        <br></br>
        Please, make sure you connect your computer to your home Wi-Fi network and click refresh below.
      </>
    )
  }
  return (
    <>
      <br></br>
      <br></br>
      After your pi-top restarts, make sure to reconnect your computer to the 'pi-top' Wi-Fi network to finish onboarding.
    </>
  )
}

export default ({
  active,
  piTopIpAddress,
  shouldMoveAwayFromAp,
  onSkip,
  onContinue,
}: Props) => {

  const url = "http://" + piTopIpAddress + "/onboarding/reboot";

  return (
    <Dialog active={active} message={getMessage(shouldMoveAwayFromAp)} className={styles.dialog} testId="connectivity-dialog">
      <div className={styles.content}>
        <div className={styles.message}>
          {getContent(shouldMoveAwayFromAp)}
        </div>

        <div className={styles.buttons}>
          {shouldMoveAwayFromAp ?
            <>
            <div className={styles.refreshButtonContainer}>
              <Button className={styles.refreshButton} unstyled onClick={() => window.open(url, "_self")} >
                Refresh
              </Button>
            </div>

            <div className={styles.skipButtonContainer}>
              <Button className={styles.skipButton} unstyled onClick={() => onSkip()}>
                Skip
              </Button>
            </div>
            </>
        : <>
          <div className={styles.continueButtonContainer}>
            <Button className={styles.continueButton} unstyled onClick={() => onContinue()}>
              Continue
            </Button>
          </div>
          </>
        }
        </div>

      </div>
    </Dialog>
  );
};
