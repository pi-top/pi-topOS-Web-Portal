import React from "react";
import cx from "classnames";

import styles from "./LandingPage.module.css";

import LandingHeader from "../../components/landingHeader/LandingHeader";
import LandingContainer from "../../components/landingContainer/LandingContainer";
import { LandingPageElement } from "../../components/landing_app/App";

export type Props = {
    pages: LandingPageElement[];
};

export default ({pages} : Props) => {
    return (
    <div className={cx(styles.layout)}>
        <LandingHeader />
        <LandingContainer
            pages={pages}
        />
    </div>
    );
};
