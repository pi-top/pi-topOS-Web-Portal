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
      <span className={styles.dialogTitle}>{shouldMoveAwayFromAp ? "Reconnect to your Wi-Fi" : "Reconnect to the pi-top network"} </span>
    </>
  );
};

export const getContent = (shouldMoveAwayFromAp: boolean) => {
  if (shouldMoveAwayFromAp) {
    return (
      <>
        Your pi-top is now connected to the Wi-Fi network you configured in a previous step, but your computer is still on the 'pi-top-XXXX' network.
        <br></br>
        <br></br>
        To complete onboarding, please switch your computer back to your regular Wi-Fi network and click refresh below.
      </>
    )
  }
  return (
    <>
      After your pi-top restarts, you will need to reconnect your computer to the 'pi-top-XXXX' Wi-Fi network to finish onboarding.
      <br></br>
      <br></br>
      This page may not update until you have reconnected to the network.
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
