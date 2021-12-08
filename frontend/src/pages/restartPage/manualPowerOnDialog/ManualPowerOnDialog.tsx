import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import Button from "../../../components/atoms/button/Button";

import styles from "./ManualPowerOnDialog.module.css";

export type Props = {
  active: boolean;
  onClose: () => void;
};

const getMessage = () => {
  return (
    <>
      <span className={styles.dialogTitle}>Your device will power off!</span>
    </>
  );
};

export default ({
  active,
  onClose,
}: Props) => {

  return (
    <Dialog active={active} message={getMessage()} className={styles.dialog}>
      <div className={styles.content}>
        <div className={styles.message}>
          When you click the "Continue" button, your pi-top will turn off!
          <br></br>
          <br></br>
          Make sure that you turn it back on and wait in this page for the device to boot.
          <br></br>
          <br></br>
          Don't close this page!
        </div>

        <div className={styles.actions}>
          <Button onClick={() => onClose()}>Continue</Button>
        </div>
      </div>
    </Dialog>
  );
};
