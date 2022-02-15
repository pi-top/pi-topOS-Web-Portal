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
        You've connected your pi-top to Wi-Fi but this computer is still on the pi-top's hotspot.
        <br></br>
        <br></br>
        Please switch this computer to the Wi-Fi you chose for your pi-top and click refresh below.
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
