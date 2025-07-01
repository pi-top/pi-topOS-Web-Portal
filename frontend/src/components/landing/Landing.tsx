import React, { useEffect } from "react";
import cx from "classnames";
import styles from "./Landing.module.css";

import Button from "../atoms/button/Button";

import stopFirstBootAppAutostart from "../../services/stopFirstBootAppAutostart";

export type LandingPageElement = {
  title: string;
  id: string;
  detail: JSX.Element;
};

export type LandingPageObjs = {
  [key: string]: LandingPageElement;
}


export type Props = {
  pages: LandingPageObjs;
  selectedElementId: string;
  onSelectElement: (id: string) => void;
};

export default ({ pages, selectedElementId, onSelectElement }: Props) => {
  useEffect(() => {
    stopFirstBootAppAutostart().catch(() => null);
  }, []);

  return (
    <div className={cx(styles.container)}>
      <div className={styles.landingList}>
        {Object.values(pages).map((element) => (
          <div key={element.id} className={styles.elementDiv}>
            <Button
              unstyled
              className={cx(
                styles.element,
                selectedElementId === element.id
                  ? styles.selectedElement
                  : ""
              )}
              onClick={() => onSelectElement(element.id)}
            >
              <span className={styles.elementText}>{element.title}</span>
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.landingPage}>
        <div className={styles.detailContainer}>
          {pages[selectedElementId].detail}
        </div>
      </div>
    </div>
  );
};
