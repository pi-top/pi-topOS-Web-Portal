import { ValueType } from "react-select";

type SelectOption = { value: string; label: string; };

export default function isSingleOption(onChangeValue: ValueType<SelectOption>): onChangeValue is SelectOption {
  if (!onChangeValue) {
    return false;
  }

  if (Array.isArray(onChangeValue)) {
    return false;
  }

  const option = onChangeValue as SelectOption | null | undefined;
  if (!(option?.value && option?.label)) {
    return false;
  }

  return true;
}
