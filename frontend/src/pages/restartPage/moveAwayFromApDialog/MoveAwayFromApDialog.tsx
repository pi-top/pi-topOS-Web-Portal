import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import Button from "../../../components/atoms/button/Button";

import styles from "./MoveAwayFromApDialog.module.css";

export type Props = {
  active: boolean;
  piTopIpAddress: string;
  onSkip: () => void;
};

const getMessage = () => {
  return (
    <>
      <span className={styles.dialogTitle}>Reconnect to your Wi-Fi</span>
    </>
  );
};

export default ({
  active,
  piTopIpAddress,
  onSkip,
}: Props) => {

  const url = "http://" + piTopIpAddress + "/onboarding/reboot";

  return (
    <Dialog active={active} message={getMessage()} className={styles.dialog} dataTestId="move-away-from-ap-dialog">
      <div className={styles.content}>
        <div className={styles.message}>
          Your pi-top is not connected to the same network as your device.
          <br></br>
          <br></br>
          This probably means that your computer is connected to the 'pi-top' network and your pi-top was configured to connect to your Wi-Fi network in one of the previous steps.
          <br></br>
          <br></br>
          Please, make sure you connect your computer to your Wi-Fi network and refresh this page.
        </div>

        <div className={styles.buttons}>
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
        </div>

      </div>
    </Dialog>
  );
};
