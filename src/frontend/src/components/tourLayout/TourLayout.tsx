import React, { ReactNode } from "react";
import cx from "classnames";

import Button, { Props as ButtonProps } from "../atoms/button/Button";
import Spinner from "../atoms/spinner/Spinner";
import styles from "./TourLayout.module.css";
import Image from "../atoms/image/Image";

import closeButton from "../../assets/images/tour-close-button.svg";

import { runningOnWebRenderer } from "../../helpers/utils";

type LayoutButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
};

export type Props = {
  banner: {
    src: string;
    alt: string;
  };
  prompt: ReactNode;
  nextButton: LayoutButtonProps;
  title?: ReactNode;
  explanation?: ReactNode;
  children?: ReactNode;
  className?: string;
  isLoadingBanner?: boolean;
  onCloseButton: () => void;
};

export default ({
  banner: { src, alt },
  prompt,
  nextButton,
  title,
  explanation,
  children,
  className,
  isLoadingBanner,
  onCloseButton,
}: Props) => (
  <div className={cx(styles.layout, className)}>

    {runningOnWebRenderer() &&
      <Button className={styles.closeButton} unstyled onClick={onCloseButton}>
        <Image
          src={closeButton}
          alt=""
          imageScale={1}
          className={styles.closeButtonImg}
        />
      </Button>
    }

    <div className={styles.header}>
      <h1 className={styles.prompt}>{prompt}</h1>
    </div>

    <div className={styles.bannerStack}>
      <Image
        src={src}
        alt={alt}
        imageScale={1}
      />

      {isLoadingBanner ? (
        <div className={styles.bannerTitle}>
          <Spinner size={60} />
        </div>
      ) : (
        <>
        <h2 className={styles.bannerTitle}>{title}</h2>
        <div className={styles.explanationDiv}>
          <span className={styles.explanation}>{explanation}</span>
        </div>
        </>
      )}
    </div>

    <div className={styles.content}>
      <div className={styles.children}>{children}</div>

      <div className={styles.spacer} />

      <div className={styles.buttons}>
        <Button {...nextButton}>
          {nextButton.label ? nextButton.label : "Next"}
        </Button>
      </div>

    </div>
  </div>
);
