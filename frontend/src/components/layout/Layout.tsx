import React, { ReactNode } from "react";
import cx from "classnames";

import PrimaryButton, { Props as ButtonProps } from "../primaryButton/PrimaryButton";
import Button from "../atoms/button/Button";
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
  showNext?: boolean;
  showBack?: boolean;
  showHeader?: boolean;
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
  showHeader = true,
  showNext = true,
  showSkip = true,
  showBack = true,
  explanation,
  children,
  className,
  isLoading,
}: Props) => (


  <div className={cx(styles.layout, className)}>
    {showHeader && <Header />}
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
      {explanation && <span className={styles.explanation}>{explanation.split('\n').map(function (item, key) {
        return (<span key={key}>{item}<br /></span>)
      })
      }</span>}

      {children}

      <div className={styles.spacer} />

      <div className={styles.buttons}>
        <div className={styles.backButtonContainer}>
          {backButton && showBack && (
            <Button {...backButton} className={styles.backButton} unstyled>
              {backButton.label ? backButton.label : "Back"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <Spinner size={60} />
        ) : (
          showNext && <PrimaryButton {...nextButton}>
            {nextButton.label ? nextButton.label : "Next"}
          </PrimaryButton>
        )}

        <div className={styles.skipButtonContainer}>
          {skipButton && showSkip && (
            <Button {...skipButton} className={styles.skipButton} unstyled>
              {skipButton.label ? skipButton.label : "Skip"}
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);
