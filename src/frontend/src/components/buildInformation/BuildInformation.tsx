import React from "react";

import styles from "./BuildInformation.module.css";
import { BuildInfo } from "../../types/Build";

export type Props = {
  info?: BuildInfo;
};

export default ({ info }: Props) => {
  if (!info) {
    return null;
  }

  return (
    <div data-testid="build-info" className={styles.root}>
      pi-topOS Build Number : {info?.buildNumber}<br />
      Repository ID: {info?.buildRepo}<br />
      Build Date: {info?.buildDate}<br />
    </div>
  );
};
