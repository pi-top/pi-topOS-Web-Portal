import Select, { Props as SelectProps } from "react-select";
import cx from "classnames";

import styles from "./Select.module.css";
import isSingleOption from "./helpers/isSingleOption";

export type Props = Omit<SelectProps, 'onChange'> & {
  onChange: (value: string) => void;
}

export default (props: Props) => (
  <Select
    isSearchable
    {...props}
    onChange={(option) => {
      if (isSingleOption(option)) {
        props.onChange(option.value);
      }
    }}
    className={cx(styles.select, props.className)}
    classNamePrefix="ReactSelect"
  />
);
