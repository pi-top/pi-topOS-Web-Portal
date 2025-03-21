import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import PrimaryButton from "../../../components/primaryButton/PrimaryButton";
import PrivacyPolicy from "../../../components/privacyPolicy/PrivacyPolicy";

import styles from "./PrivacyPolicyDialog.module.css";

export type Props = {
  active: boolean;
  onClose: () => void;
};

const getMessage = () => {
  return (
    <>
      <span className={styles.dialogTitle}>PI-TOP PRIVACY POLICY</span>
    </>
  );
};

export default ({
  active,
  onClose,
}: Props) => {

  return (
    <Dialog testId="privacy-policy-dialog" active={active} message={getMessage()} className={styles.privacyDialog}>
      <div className={styles.content}>
        <div className={styles.message}>
          <h4>Summary</h4>
          This policy defines and clarifies what data is collected in connection with
          CEED LTD (doing business as 'pi-top') products and services.
        </div>

        <div className={styles.termsContainer}>
          <PrivacyPolicy />
        </div>

        <div className={styles.actions}>
          <PrimaryButton onClick={() => onClose()}>Close</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
