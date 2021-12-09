import React from "react";
import cx from "classnames";

import styles from "./LandingPage.module.css";

import LandingHeader from "../../components/landingHeader/LandingHeader";
import Landing from "../../components/landing/Landing";

export default () => {
  return (
    <div className={cx(styles.layout)}>
      <LandingHeader />
      <Landing />
    </div>
  );
};
