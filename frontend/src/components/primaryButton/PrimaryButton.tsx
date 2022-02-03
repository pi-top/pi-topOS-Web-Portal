import React, { ReactNode, memo } from 'react';
import cx from 'classnames';

import Button from '../atoms/button/Button';

import styles from './PrimaryButton.module.css';

export type Props = {
  children: ReactNode
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'reset' | 'submit';
  hidden?: boolean
};

const PrimaryButton = ({
  children,
  className,
  disabled = false,
  onClick,
  type,
  ...props
}: Props) => {
  return (
    <Button
      {...props}
      onClick={onClick}
      disabled={disabled}
      className={cx(className, styles.btn)}
      type={type}
      unstyled
    >
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.primaryButtonSVGContainer}
      >
        <defs>
          <symbol
            id="corner"
            width="100"
            height="50"
            viewBox="0 0 100 50"
            className={styles.rolloverFill}
          >
            <path
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
              d="
                M 100 92
                L 86.74 92
                C 49.9 90.713 31.68 87.629 19.35 76.94
                C 1.11 61.325 1.95 34.495 21.14 19.875
                C 36.5 7.998 61.45 4.885 86.74 5
                L 100 5
                "
              className={styles.border}
            />
          </symbol>

          <symbol id="topBottom" viewBox="0 0 270 4" preserveAspectRatio="none">
            <path
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
              d="m 0 2 l 270 0"
            />
          </symbol>

          <symbol
            id="leftRight"
            viewBox="0 0 80 7.6"
            preserveAspectRatio="none"
          >
            <use href="#topBottom" transform="rotate(90)" x="0" y="-4.7" />
          </symbol>
        </defs>

        {/* <!-- the corners: --> */}

        {/* <!-- 1. top-left: --> */}
        <use href="#corner" width="40" height="15" />

        {/* <!-- 2. top-right: --> */}
        <use
          href="#corner"
          transform="scale(-1, 1)"
          width="40"
          height="15"
          x="-100%"
          y="0"
        />

        {/* <!-- 3. bottom-left: --> */}
        <use
          href="#corner"
          transform="scale(1, -1)"
          style={{ overflow: 'visible' }}
          width="40"
          height="15"
          x="0"
          y="-100%"
        />

        {/* <!-- 4. bottom-right: --> */}
        <use
          href="#corner"
          transform="scale(-1, -1)"
          width="40"
          height="15"
          x="-100%"
          y="-100%"
        />

        {/* <!-- the edges: --> */}

        {/* 5 top: */}
        <foreignObject x="0" y="0" width="100%" height="10px">
          <span
            style={{
              display: 'flex',
              lineHeight: 0,
              margin: '0.4px 34.5px 0 34.9px',
            }}
            className={styles.rolloverBG}
          >
            <svg
              width="100%"
              height="10"
              preserveAspectRatio="none"
              version="1.1"
            >
              <use
                href="#topBottom"
                className={cx(styles.border)}
                width="100%"
                height="2"
                x="0"
                y="0.3"
              />
            </svg>
          </span>
        </foreignObject>

        {/* 6 bottom: */}
        <foreignObject
          x="0"
          y="-100%"
          width="100%"
          height="10px"
          transform="scale(1, -1)"
        >
          <span
            style={{ display: 'block', lineHeight: 0, margin: '0 34.9px' }}
            className={styles.rolloverBG}
          >
            <svg
              width="100%"
              height="10"
              preserveAspectRatio="none"
              version="1.1"
            >
              <use
                href="#topBottom"
                className={cx(styles.border)}
                width="100%"
                height="10"
                x="0"
                y="-3.8"
              />
            </svg>
          </span>
        </foreignObject>

        {/* 7 left: */}
        <foreignObject x="0" y="0" width="50px" height="100%">
          <span
            style={{
              display: 'flex',
              position: 'absolute',
              left: '6px',
              top: '14.7px',
              bottom: '14.7px',
              width: '20px',
            }}
            className={styles.rolloverBG}
          >
            <svg
              width="50px"
              height="100%"
              preserveAspectRatio="none"
              version="1.1"
            >
              <use
                href="#leftRight"
                className={cx(styles.border)}
                width="140"
                height="100%"
                x="-1px"
                y="0"
              />
            </svg>
          </span>
        </foreignObject>

        {/* 8 right: */}
        <foreignObject x="0" y="0" width="100%" height="100%">
          <span
            style={{
              display: 'flex',
              position: 'absolute',
              left: '20px',
              right: '5px',
              top: '14.7px',
              bottom: '14.7px',
            }}
            className={styles.rolloverBG}
          >
            <svg
              width="100%"
              height="100%"
              version="1.1"
              preserveAspectRatio="xMaxYMin meet"
            >
              <use
                href="#leftRight"
                className={cx(styles.border)}
                width="140"
                height="100%"
                x="-100%"
                y="0"
                transform="scale(-1, 1)"
              />
            </svg>
          </span>
        </foreignObject>

        {/* 9 centre */}
        {/* not used */}
      </svg>
      <span className={cx(styles.textWrapper, styles.rolloverFill)}>
        {children}
      </span>
    </Button>
  );
};

export default memo(PrimaryButton);
