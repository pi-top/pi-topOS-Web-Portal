import React from "react";
import styles from "./Link.module.css";
import cx from "classnames";

export type Props = JSX.IntrinsicElements['a']

export default ({ children, className, ...props }: Props) => (
  <a {...props} className={cx(styles.root, className)}>
    {children}
  </a>
);
