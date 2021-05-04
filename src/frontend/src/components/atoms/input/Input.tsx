import React, { PureComponent, InputHTMLAttributes } from "react";
import cx from "classnames";

import styles from "./Input.module.css";

export type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  autoCapitalize?: string;
  autoCorrect?: string;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  defaultValue?: string;
  disabled?: boolean;
  id: string;
  label?: string;
  maxLength?: number;
  minLength?: number;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onPaste?: (pastedText: string) => string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  helpText?: string;
};

export type State = {
  value: string;
};

export default class Input extends PureComponent<Props, State> {
  state = {
    value: this.props.defaultValue || ""
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { defaultValue } = this.props;
    if (nextProps.defaultValue !== defaultValue) {
      const value = nextProps.defaultValue || "";
      this.setState({ value });
      this.handleChange({ target: { value } });
    }
  }

  handlePaste = (ev: React.ClipboardEvent<HTMLInputElement>) => {
    const { onPaste } = this.props;

    ev.preventDefault();

    const text = ev.clipboardData.getData("Text");
    const returnedValue = onPaste ? onPaste(text) : text;

    this.handleChange({ target: { value: returnedValue } });
  };

  handleChange = ({ target: { value } }: { target: { value: string } }) => {
    const { onChange = () => null } = this.props;

    this.setState({ value }, () => {
      onChange(value);
    });
  };

  render() {
    const {
      autoCapitalize,
      autoCorrect,
      autoFocus,
      className,
      inputClassName,
      disabled,
      id,
      label,
      maxLength,
      minLength,
      onBlur,
      onFocus,
      onPaste,
      placeholder,
      required,
      type,
      helpText,
      defaultValue,
      ...props
    } = this.props;
    const { value } = this.state;

    return (
      <div className={cx(styles.root, className)}>
        {label && (
          <label className={styles.label} htmlFor={id}>
            {label}
          </label>
        )}
        <input
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          className={cx(styles.input, inputClassName)}
          disabled={disabled}
          id={id}
          maxLength={maxLength}
          minLength={minLength}
          onBlur={onBlur}
          onFocus={onFocus}
          onPaste={onPaste ? this.handlePaste : () => {}}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
          {...props}
          onChange={this.handleChange}
        />
        {helpText && <span className={styles.helpText}>{helpText}</span>}
      </div>
    );
  }
}
