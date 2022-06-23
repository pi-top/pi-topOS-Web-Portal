import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import PrimaryButton from "../../../components/primaryButton/PrimaryButton";
import Spinner from "../../../components/atoms/spinner/Spinner";

import styles from "./AdvancedConfigDialog.module.css";

export type Props = {
  active: boolean;
  url: string;
  onClose: () => void;
  error: boolean;
};

export enum ErrorMessage {
  AdvancedConfigError = "There was a problem opening the advanced network configuration.",
}

export default ({ active, url, onClose, error }: Props) => {
  const errorMessage = error && ErrorMessage.AdvancedConfigError;

  return (
    <Dialog
      testId="advanced-config-dialog"
      active={active}
      title="Advanced Wifi Configuration"
    >
      <div className={styles.content}>
          { url === "" ?
              <div className={styles.spinner}>
                <Spinner size={80} />
              </div>
            :
              <div className={styles.frameContainer}>
                <iframe
                  src={url}
                  data-testid="advanced-config-dialog-frame"
                  title="Advanced Wifi Configuration"
                  className={styles.frame}
                >
                </iframe>
              </div>
          }
          {errorMessage && <span className={styles.error}>{errorMessage}</span>}
        <div className={styles.actions}>
          <PrimaryButton onClick={() => onClose()}>Close</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
