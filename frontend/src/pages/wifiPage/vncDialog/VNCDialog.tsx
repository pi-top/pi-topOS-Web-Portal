import React from "react";

import Dialog from "../../../components/atoms/dialog/Dialog";

import styles from "./VNCDialog.module.css";

export type Props = {
  active: boolean;
  onCancel: () => void;
};

export default ({ active }: Props) => {
  return (
    <Dialog
      testId="vnc-dialog"
      active={active}
    >
      <div className={styles.frameContainer}>

      </div>
    </Dialog>
  );
};
