import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import PrimaryButton from "../../../components/primaryButton/PrimaryButton";
import TermsAndConditions from "../../../components/termsAndConditions/TermsAndConditions";
import styles from "./TermsDialog.module.css";

export type Props = {
  active: boolean;
  onClose: () => void;
};

const getMessage = () => {
  return (
    <>
      <span className={styles.dialogTitle}>PI-TOP TERMS & CONDITIONS</span>
    </>
  );
};

export default ({
  active,
  onClose,
}: Props) => {

  return (
    <Dialog testId="terms-dialog-content" active={active} message={getMessage()} className={styles.termsDialog}>
      <div className={styles.content}>

        <div className={styles.termsContainer}>
          <TermsAndConditions />
        </div>

        <div className={styles.actions}>
          <PrimaryButton onClick={() => onClose()}>Close</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
