import React from "react";
import styles from "./CloseButton.module.css";
import MaskedDiv from "../atoms/masked/MaskedDiv";
import Button from "../atoms/button/Button";
import closeButtonImage from "../../assets/images/landing-close-button.svg";
import cx from "classnames";

type Props = {
  onClose?: () => void;
  className?: string;
};

export default ({ onClose, className }: Props) => {
  return (
    <MaskedDiv
      className={cx(styles.closeButtonDiv, className)}
      mask={`url(${closeButtonImage})`}
    >
      <Button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="close-window"
      >
      </Button>
    </MaskedDiv>
  );
};
