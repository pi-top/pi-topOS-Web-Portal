import { ReactNode } from "react";
import cx from 'classnames';

import styles from './MaskedDiv.module.css';

export type Props = {
  mask: string,
  children?: ReactNode,
  className: string,
};

export default ({
  mask,
  children,
  className,
}: Props) => (
  <div
    className={cx(styles.root, className)}
    style={{
      maskImage: mask,
      WebkitMaskImage: mask,
    }}
  >
    {children}
  </div>
);
