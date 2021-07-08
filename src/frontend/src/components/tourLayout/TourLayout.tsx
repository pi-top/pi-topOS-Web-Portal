import React, { ReactNode } from "react";
import cx from "classnames";

import Button, { Props as ButtonProps } from "../atoms/button/Button";
import Spinner from "../atoms/spinner/Spinner";
import MaskedDiv from "../atoms/masked/MaskedDiv";

import styles from "./TourLayout.module.css";
import Image from "../atoms/image/Image";

import closeButtonImage from "../../assets/images/tour-close-button.svg";

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
  <div className={cx(!runningOnWebRenderer() && styles.layoutBrowser, styles.layout , className)}>

    {runningOnWebRenderer() &&
      <MaskedDiv
        className={cx(styles.closeButtonDiv)}
        mask={`url(${closeButtonImage})`}
      >
        <Button className={styles.closeButton} onClick={onCloseButton}> </Button>
      </MaskedDiv>
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
      <h2 className={styles.bannerTitle}>{!isLoadingBanner && title}</h2>
      <div className={styles.explanationDiv}>
        <span className={styles.explanation}>{isLoadingBanner? <Spinner size={55} /> : explanation}</span>
      </div>
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
