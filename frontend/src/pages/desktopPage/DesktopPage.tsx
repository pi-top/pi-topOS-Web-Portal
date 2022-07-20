import React from "react";
import cx from "classnames";

import styles from "./DesktopPage.module.css";
import Spinner from "../../components/atoms/spinner/Spinner";


export type Props = {
  url: string
  error: boolean
}

const errorMessage = "There was an error opening the page. Make sure VNC is enabled in your device and try again.";

export default ({ url, error} : Props) => {
  return (
    <div className={cx(styles.content)}>
      <div className={styles.container}>
        { error && <span className={styles.error}>{errorMessage}</span> }
        { !error && url === "" && <Spinner size={80} /> }
        { url &&
          <iframe
            src={url}
            data-testid="vnc-desktop"
            title="Desktop"
            className={styles.frame}
          >
          </iframe>
        }
      </div>
    </div>
  );
};
