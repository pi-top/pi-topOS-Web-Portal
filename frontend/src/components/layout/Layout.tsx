import React, { ReactNode } from "react";
import cx from "classnames";

import Button, { Props as ButtonProps } from "../atoms/button/Button";
import Spinner from "../atoms/spinner/Spinner";
import styles from "./Layout.module.css";
import Image from "../atoms/image/Image";
import Header from "../header/Header";

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
  isLoading?: boolean;
  skipButton?: LayoutButtonProps;
  backButton?: LayoutButtonProps;
  showSkip?: boolean;
  showBack?: boolean;
  explanation?: string;
  children?: ReactNode;
  className?: string;
};

export default ({
  banner: { src, alt },
  prompt,
  nextButton,
  skipButton,
  backButton,
  showSkip = true,
  showBack = true,
  explanation,
  children,
  className,
  isLoading,
}: Props) => (


  <div className={cx(styles.layout, className)}>
    <Header />
    <div className={styles.banner}>
      <Image
        src={src}
        alt={alt}
        imageScale={1}
        className={styles.bannerImage}
      />

      <h1 className={styles.prompt}>{prompt}</h1>
    </div>

    <div className={styles.content}>
      {explanation && <span className={styles.explanation}>{explanation.split('\n').map(function(item, key) {
          return (<span key={key}>{item}<br/></span>)
        })
      }</span>}

      {children}

      <div className={styles.spacer} />

      <div className={styles.buttons}>
        <div className={styles.backButtonContainer}>
          {backButton && showBack && (
            <Button {...backButton} className={styles.backButton} unstyled>
              Back
            </Button>
          )}
        </div>

        {isLoading ? (
          <Spinner size={60} />
        ) : (
          <Button {...nextButton}>
            {nextButton.label ? nextButton.label : "Next"}
          </Button>
        )}

        <div className={styles.skipButtonContainer}>
          {skipButton && showSkip && (
            <Button {...skipButton} className={styles.skipButton} unstyled>
              Skip
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);
