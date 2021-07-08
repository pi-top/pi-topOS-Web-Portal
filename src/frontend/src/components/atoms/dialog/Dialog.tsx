import React, { ReactNode } from "react";
import cx from "classnames";
import { createPortal } from "react-dom";

import styles from "./Dialog.module.css";

export type Props = {
  active: boolean;
  message: ReactNode;
  onClose?: () => void;
  children: JSX.Element;
  className?: string;
  backdropClassName?: string;
};

const Dialog = ({
  active,
  message,
  onClose,
  children,
  className,
  backdropClassName,
}: Props) => {
  return createPortal(
    <div
      data-testid="dialog"
      role="button"
      aria-pressed="false"
      onClick={onClose}
      className={cx(styles.backdrop, backdropClassName, {
        [styles.hidden]: !active,
      })}
    >
      <div
        aria-hidden={!active}
        aria-modal
        className={cx(styles.dialog, className)}
        role="dialog"
      >
        <header className={styles.header}>
          <h3 data-testid="dialog-message" className={styles.messageContainer}>
            {message}
          </h3>
        </header>

        {children}
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
