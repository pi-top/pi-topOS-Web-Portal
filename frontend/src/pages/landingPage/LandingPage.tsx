import React from "react";
import cx from "classnames";

import styles from "./LandingPage.module.css";

import LandingHeader from "../../components/landingHeader/LandingHeader";
import LandingContainer from "../../components/landingContainer/LandingContainer";

export default () => {
    return (
    <div className={cx(styles.layout)}>
        <LandingHeader />
        <LandingContainer />
    </div>
    );
};
