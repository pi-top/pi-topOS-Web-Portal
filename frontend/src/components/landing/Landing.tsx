import React, { useEffect, useState } from "react";
import cx from "classnames";
import styles from "./Landing.module.css";

import Button from "../atoms/button/Button";

import stopOnboardingAutostart from "../../services/stopOnboardingAutostart";

export type LandingPageElement = {
  title: string;
  id: string;
  detail: JSX.Element;
};

export type Props = {
  pages: LandingPageElement[];
};

export default ({ pages }: Props) => {
  const [selectedElement, setSelectedElement] = useState(pages[0]);

  useEffect(() => {
    stopOnboardingAutostart().catch(() => null);
  }, []);

  return (
    <div className={cx(styles.container)}>
      <div className={styles.landingList}>
        {pages.map((element) => (
          <div key={element.id} className={styles.elementDiv}>
            <Button
              unstyled
              className={cx(
                styles.element,
                selectedElement.id === element.id
                  ? styles.selectedElement
                  : ""
              )}
              onClick={() => setSelectedElement(element)}
            >
              <span className={styles.elementText}>{element.title}</span>
            </Button>
          </div>
        ))}
      </div>

      <div className={styles.landingPage}>
        <div className={styles.detailContainer}>
          {selectedElement.detail}
        </div>
      </div>
    </div>
  );
};
