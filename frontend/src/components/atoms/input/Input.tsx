import React, { HTMLProps, useCallback } from "react";
import cx from "classnames";

import styles from "./Input.module.css";

export type Props = Omit<HTMLProps<HTMLInputElement>, "onChange"> & {
  id: string;
  ariaLabel?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  autoFocus?: boolean;
  bordered?: boolean;
  className?: string;
  value?: string;
  defaultValue?: string;
  helpText?: string;
  innerRef?: (e: HTMLInputElement) => void;
  inputClassName?: string;
  maskPath?: string;
  masked?: boolean;
  onChange?: (s: string) => void;
};

const Input = ({
  id,
  ariaLabel = "",
  bordered = false,
  className = "",
  helpText = "",
  innerRef,
  inputClassName = "",
  label = "",
  defaultValue = "",
  onKeyDown = () => {},
  onChange = () => {},
  type = "text",
  ...restProps
}: Props) => {
  const handleChange = useCallback(
    (
      ev: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }
    ) => {
      const {
        target: { value: newValue },
      } = ev;

      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className={className}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        aria-label={ariaLabel}
        // overwrite aria-label if it is passed in restProps
        {...restProps}
        type={type}
        className={cx(styles.input, inputClassName)}
        id={id}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        ref={innerRef}
      />
      {helpText && <span className={styles.helpText}>{helpText}</span>}
    </div>
  );
};

export default Input;
