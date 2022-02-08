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
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" className={styles.primaryButtonSVGContainer}>
        <defs>
          <symbol id="corner" viewBox="0 0 38 17" preserveAspectRatio="xMaxYMin slice" className={styles.rolloverFill}>
            <path d="
            M38 32 30.192 32
            C17.754 31.543 11.604 30.481 7.442 26.797 1.285 21.415 1.568 12.167 8.047 7.128 13.231 3.034 21.653 1.962 30.192 2.001
            L38 2" className={styles.border} vectorEffect="non-scaling-stroke" shapeRendering="geometricPrecision" />
          </symbol>

          <symbol id="topBottom" viewBox="0 0 100 2" preserveAspectRatio="none" className={styles.rolloverFill}>
            <path
              vectorEffect="non-scaling-stroke"
              shapeRendering="crispEdges"
              d="m 0 1 l 100 0"
              className={styles.border}
            />
          </symbol>

          <symbol
            id="leftRight"
            viewBox="0 0 100 2"
            preserveAspectRatio='xMinYMax slice'
          >
            <use href="#topBottom" transform="rotate(90)" x="0" y="-55%" />
          </symbol>

        </defs>

        {/* <!-- the corners: --> */}

        {/* <!-- 1. top-left: --> */}
        <use width="38" height="17" href="#corner" />

        {/* <!-- 2. top-right: --> */}
        <use
          href="#corner"
          transform="scale(-1, 1)"
          width="40"
          height="17"
          x="-100%"
          y="0"
        />

        {/* <!-- 3. bottom-left: --> */}
        <use
          href="#corner"
          transform="scale(1, -1)"
          style={{ overflow: 'visible' }}
          width="40"
          height="17"
          x="0"
          y="-100%"
        />

        {/* <!-- 4. bottom-right: --> */}
        <use
          href="#corner"
          transform="scale(-1, -1)"
          width="40"
          height="17"
          x="-100%"
          y="-100%"
        />

        {/* <!-- the edges: --> */}

        {/* 5 top: */}

        <foreignObject x="0" y="1" width="100%" height="2px">
          <span
            style={{
              display: 'flex',
              lineHeight: 0,
              margin: '0px 35px 0 35px',
            }}
            className={styles.rolloverBG}
          >
            <svg
              width="100%"
              height="2"
              preserveAspectRatio="none"
              version="1.1"
            >
              <use
                href="#topBottom"
                strokeWidth={2}
                stroke="green"
                width="100%"
                height="2"
                x="0"
                y="0"
              />
            </svg>
          </span>
        </foreignObject>


        {/* 6 bottom: */}
        <foreignObject
          x="0"
          y="-100%"
          width="100%"
          height="4px"
          transform="scale(1, -1)"
        >
          <span
            style={{ display: 'block', lineHeight: 0, margin: '0 35px 0 35px' }}
            className={styles.rolloverBG}
          >
            <svg
              width="100%"
              height="4"
              preserveAspectRatio="none"
              version="1.1"
            >
              <use
                href="#topBottom"
                className={cx(styles.border, styles.fix)}
                width="100%"
                height="2"
                x="0"
                y="0"
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
              left: '0',
              top: '17px',
              bottom: '17px',
              width: '40px',
            }}
            className={styles.rolloverBG}
          >
            <svg
              width="4"
              height="100%"
              preserveAspectRatio="none"
              version="1.1"
            >
              <use
                href="#leftRight"
                className={cx(styles.border, styles.fix2)}
                width="4"
                height="50"
                x="1"
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
              right: '1px',
              top: '17px',
              bottom: '17px',
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

      </svg>
      <span className={cx(styles.textWrapper, styles.rolloverFill)}>
        {children}
      </span>
    </Button>
  );
};

export default memo(PrimaryButton);
