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

  if (info.finalRepo === "sirius") {
    return (
      <div data-testid="build-info" className={styles.root}>
        pi-topOS Build Number: {info.buildNumber}<br />
        Release Date: {info.buildDate}
      </div>
    );
  }

  return (
    <div data-testid="build-info" className={styles.root}>
      Build Name: {info.buildName}<br />
      Build Number: {info.buildNumber}<br />
      Build Date: {info.buildDate}<br />
      Build Apt Repo: {info.buildRepo}<br />
      Final Apt Repo: {info.finalRepo}
    </div>
  );
};
