import Image from "../../components/atoms/image/Image";

import styles from "./ErrorPage.module.css";
import errorScreen from "../../assets/images/error-screen.png";

export default () => (
  <div className={styles.root}>
    <div className={styles.banner}>
      <Image
        src={errorScreen}
        alt="power-switch-help"
        imageScale={1.0}
        className={styles.bannerImage}
      />

      <h1 className={styles.prompt}>
        I've had some <span className="green">trouble setting up</span>
      </h1>
    </div>

    <div className={styles.content}>
      <span className={styles.explanation}>
        Please restart me by using the switch shown and contact{" "}
        <span className="green">support@pi-top.com</span>
      </span>
      <span className={styles.explanation}>
        If you are using a <span className="green">pi-top[3]</span> please press the power button on the
        keyboard
      </span>
    </div>
  </div>
);
