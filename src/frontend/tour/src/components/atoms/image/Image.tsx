import React from "react";
import classNames from "classnames";

import styles from "./Image.module.css";

export type Props = {
  src: string;
  alt: string;
  imageScale?: number;
  className?: string;
};

export default ({ src, alt, imageScale = 0.8, className }: Props) => {
  const scale = `${imageScale * 100}%`;
  const style = {
    maxHeight: scale,
    maxWidth: scale
  };

  const theme = classNames(styles.root, className, {
    [styles.oversized]: imageScale > 1
  });
  const imageTheme = classNames(styles.image, {
    [styles.oversized]: imageScale > 1
  });

  return (
    <div className={theme}>
      <img
        src={src}
        alt={alt}
        style={style}
        className={imageTheme}
        draggable={false}
      />
    </div>
  );
};
