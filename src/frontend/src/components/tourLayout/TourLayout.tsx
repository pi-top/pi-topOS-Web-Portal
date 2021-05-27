import React, { ReactNode } from "react";
import cx from "classnames";

import Button, { Props as ButtonProps } from "../atoms/button/Button";
import Spinner from "../atoms/spinner/Spinner";
import styles from "./TourLayout.module.css";
import Image from "../atoms/image/Image";

type LayoutButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
};

export type Props = {
  banner: {
    src_banner: string;
    alt_banner: string;
  };
  bannerCover: {
    src_cover: string;
    alt_cover: string;
  };
  prompt: ReactNode;
  nextButton: LayoutButtonProps;
  isLoading?: boolean;
  title?: ReactNode;
  explanation?: ReactNode;
  children?: ReactNode;
  className?: string;
  isLoadingBanner: boolean;
};

export default ({
  banner: { src_banner, alt_banner },
  bannerCover: { src_cover, alt_cover },
  prompt,
  nextButton,
  title,
  explanation,
  children,
  className,
  isLoading,
  isLoadingBanner,
}: Props) => (
  <div className={cx(styles.layout, className)}>
    <div className={styles.header}>
      <h1 className={styles.prompt}>{prompt}</h1>
    </div>

    <div className={styles.bannerStack}>
      <div className={styles.banner}>
        <Image
          src={src_banner}
          alt={alt_banner}
          imageScale={1}
          className={styles.bannerImage}
        />
      </div>

      {src_cover && <div className={styles.bannerCover}>
        <Image
          src={src_cover}
          alt={alt_cover}
          imageScale={1}
          className={styles.bannerCoverImage}
        />
      </div>}

      {isLoadingBanner ? (
        <div className={styles.bannerTitle}>
          <Spinner size={60} />
        </div>
      ) : (
        <>
        <h2 className={styles.bannerTitle}>{title}</h2>
        <div className={styles.explanationDiv}><span className={styles.explanation}>{explanation}</span></div>
        </>
      )}
    </div>



    <div className={styles.content}>
      <div className={styles.children}>
        {children}
      </div>

      <div className={styles.spacer} />

      <div className={styles.buttons}>
        {isLoading ? (
          <Spinner size={60} />
        ) : (
          <Button {...nextButton}>
            {nextButton.label ? nextButton.label : "Next"}
          </Button>
        )}
      </div>

    </div>
  </div>
);
