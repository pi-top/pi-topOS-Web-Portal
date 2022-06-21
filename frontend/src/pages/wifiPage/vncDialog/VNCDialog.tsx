import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import PrimaryButton from "../../../components/primaryButton/PrimaryButton";

import styles from "./VNCDialog.module.css";

export type Props = {
  active: boolean;
  url: string;
  onClose: () => void;
};

export default ({ active, url, onClose }: Props) => {
  return (
    <Dialog
      testId="vnc-dialog"
      active={active}
      title="Advanced Wifi Configuration"
    >
      <div className={styles.content}>
        <div className={styles.frameContainer}>
          { url &&
            <iframe
              src={url}
              title="Advanced Wifi Configuration"
              className={styles.frameContent}
            >
            </iframe>
          }
        </div>

        <div className={styles.actions}>
          <PrimaryButton onClick={() => onClose()}>Close</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
