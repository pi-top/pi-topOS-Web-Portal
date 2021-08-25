import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";
import Button from "../../../components/atoms/button/Button";

import styles from "./NewOsVersionDialog.module.css";

import { runningOnWebRenderer } from "../../../helpers/utils";

export type Props = {
  active: boolean;
  requireBurn: boolean;
  shouldBurn: boolean;
  onClose: () => void;
};

export enum OsBurnExplanation {
  ShouldBurn = "There is a major OS update available so the update process will take a while. We recommend reburning the SD card.",
  RequireBurn = "This OS version is out of date and not maintained. Your pi-top will not have the latest security updates and features, even if you fully update the system.",
  Recommendation = "You can also find instructions for downloading and installing the latest version of pi‑topOS from our website.",
  GoToWebsite = "For more information, go to ",
}

const getFormattedLink = (url: string) => {
  return (
    <Button className={styles.link} unstyled onClick= {() => !runningOnWebRenderer() && window.open(url)}>{url}</Button>
  );
};

const getMessage = (requireBurn: boolean) => {
  return (
    <>
      <span className={styles.dialogTitle}>
        {requireBurn? "This version of pi-topOS is no longer supported": "Major OS update required"}
      </span>
    </>
  );
};

export default ({
  active,
  requireBurn,
  shouldBurn,
  onClose,
}: Props) => {

  return (
    <Dialog active={active} message={getMessage(requireBurn)} className={styles.newOsVersionAvailableDialog}>
      <div className={styles.content}>

          <span className={styles.osUpgradeWarning}>
            {requireBurn && OsBurnExplanation.RequireBurn}
            {shouldBurn && !requireBurn && OsBurnExplanation.ShouldBurn}
          </span>
          <br></br>

          <span className={styles.osUpgradeWarning}>
            {OsBurnExplanation.GoToWebsite}
            {getFormattedLink("https://pi-top.com/help/out-of-date")}
          </span>
          <br></br>

          <span className={styles.osUpgradeWarning}>
            {OsBurnExplanation.Recommendation}
          </span>
          <br></br>

        <div className={styles.actions}>
          <Button onClick={() => onClose()}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};
