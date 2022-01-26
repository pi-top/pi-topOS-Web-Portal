import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import Button from "../../../components/atoms/button/Button";
import leftAlone from "../../../assets/images/left-alone.png";

import styles from "./SkipWarningDialog.module.css";

export type Props = {
  active: boolean;
  onConnectClick: () => void;
  onSkipClick: () => void;
};

export default ({ active, onConnectClick, onSkipClick }: Props) => {
  return (
    <Dialog
      testId="skip-warning-dialog"
      active={active}
      image={leftAlone}
      title="Please don't leave me all alone!"
      message="It’s very important I connect to the internet so I can update my software and security. We advise you connect to WiFi now."
    >
      <div className={styles.actions}>
        <Button onClick={onConnectClick}>Connect</Button>

        <Button onClick={onSkipClick} className={styles.cancel} unstyled>
          Skip
        </Button>
      </div>
    </Dialog>
  );
};
