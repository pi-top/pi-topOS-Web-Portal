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

  // TODO: perform a similar check with latest OS
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
      {info.buildOsVersion && <>Build OS Version: {info.buildOsVersion}<br /></>}
      {info.buildName && <>Build Name: {info.buildName}<br /></>}
      {info.buildNumber && <>Build Number: {info.buildNumber}<br /></>}
      {info.buildDate && <>Build Date: {info.buildDate}<br /></>}
      {info.buildType && <>Build Type: {info.buildType}<br /></>}
      {info.buildRepo && <>Build Apt Repo: {info.buildRepo}<br /></>}
      {info.finalRepo && <>Final Apt Repo: {info.finalRepo}<br /></>}
      {info.ptOsWebPortalVersion && <>Web Portal Version: {info.ptOsWebPortalVersion}<br /></>}
      {info.hubFirmwareVersion && <>pi-top [4] firmware: {info.hubFirmwareVersion}</>}
    </div>
  );
};
