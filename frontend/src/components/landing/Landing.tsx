import React, { useEffect } from "react";
import cx from "classnames";
import styles from "./Landing.module.css";

import Button from "../atoms/button/Button";

import stopFirstBootAppAutostart from "../../services/stopFirstBootAppAutostart";

export type LandingTabContent = {
  title: string;
  id: string;
  detail: JSX.Element;
};

export type LandingTabs = {
  [key: string]: LandingTabContent;
}

export type Props = {
  tabs: LandingTabs;
  selectedTabId: string;
  onSelectTab: (id: string) => void;
};

export default ({ tabs, selectedTabId, onSelectTab }: Props) => {
  useEffect(() => {
    stopFirstBootAppAutostart().catch(() => null);
  }, []);

  return (
    <div className={cx(styles.container)}>
      <div className={styles.landingList}>
        {Object.values(tabs).map((tab) => (
          <div key={tab.id} className={styles.elementDiv}>
            <Button
              unstyled
              className={cx(
                styles.element,
                selectedTabId === tab.id
                  ? styles.selectedElement
                  : ""
              )}
              onClick={() => onSelectTab(tab.id)}
            >
              <span className={styles.elementText}>{tab.title}</span>
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.landingPage}>
        <div className={styles.detailContainer}>
          {tabs[selectedTabId].detail}
        </div>
      </div>
    </div>
  );
};
