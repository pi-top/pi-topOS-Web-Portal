import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import PrimaryButton from "../../../components/primaryButton/PrimaryButton";
import Spinner from "../../../components/atoms/spinner/Spinner";

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
          { url === "" ?
              <div className={styles.spinner}>
                <Spinner size={80} />
              </div>
            :
              <div className={styles.frameContainer}>
                <iframe
                  src={url}
                  title="Advanced Wifi Configuration"
                  className={styles.frame}
                >
                </iframe>
              </div>
          }

        <div className={styles.actions}>
          <PrimaryButton onClick={() => onClose()}>Close</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
