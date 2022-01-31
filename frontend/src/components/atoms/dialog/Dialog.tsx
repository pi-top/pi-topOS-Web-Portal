import React, { ReactNode } from "react";
import cx from "classnames";
import { createPortal } from "react-dom";

import styles from "./Dialog.module.css";

export type Props = {
  active: boolean;
  image?: string;
  title?: ReactNode;
  message?: ReactNode;
  onClose?: () => void;
  children: JSX.Element;
  className?: string;
  backdropClassName?: string;
  testId?: string;
};

const Dialog = ({
  active,
  image,
  title,
  message,
  onClose,
  children,
  className,
  backdropClassName,
  testId = 'dialog',
}: Props) => {
  return createPortal(
    <div
      data-testid={testId}
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
          {image && (
            <img src={image} alt="dialog icon" className={styles.image} />
          )}
          {title && <h3 className={styles.title}>{title}</h3>}
        </header>

        <div data-testid="dialog-message" className={styles.messageContainer}>
          {message}
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
};

export default Dialog;
