import { getName } from "country-list";
import {
  KeyboardsData,
  KeyboardVariantsData,
  Keyboard
} from "../../../types/Keyboard";
import priorityCountryCodes from "../../../data/priorityCountryCodes.json";

export const createValueFromKeyboard = (keyboard: Keyboard) => {
  if (!keyboard.variant) {
    return keyboard.layout;
  }
  return `${keyboard.layout}-${keyboard.variant}`;
};

export const createLabelFromKeyboard = (
  keyboard: Keyboard,
  keyboardsData: KeyboardsData,
  variantsData: KeyboardVariantsData
) => {
  const keyboardName =
    getName(keyboard.layout) || keyboardsData[keyboard.layout];

  if (!keyboard.variant) {
    return keyboardName;
  }

  return `${keyboardName} (${variantsData[keyboard.layout][keyboard.variant]})`;
};

export const createKeyboardFromValue: (value: string) => Keyboard = value => {
  if (value.includes("-")) {
    const [layout, variant] = value.split("-");
    return {
      layout,
      variant
    };
  }

  return {
    layout: value,
  };
};

export const createOptions = (
  keyboardsData: KeyboardsData,
  variantsData: KeyboardVariantsData
) => [
  {
    label: "Frequently Used",
    options: Object.keys(keyboardsData)
      .filter(code => priorityCountryCodes.includes(code.toUpperCase()))
      .sort(
        (a, b) =>
          priorityCountryCodes.indexOf(a.toUpperCase()) -
          priorityCountryCodes.indexOf(b.toUpperCase())
      )
      .map(code => ({
        value: createValueFromKeyboard({ layout: code }),
        label: createLabelFromKeyboard(
          { layout: code },
          keyboardsData,
          variantsData
        )
      }))
  },
  {
    label: "Standard Keyboards (A-Z)",
    options: Object.keys(keyboardsData)
      .filter(code => !priorityCountryCodes.includes(code.toUpperCase()))
      .sort(
        (a, b) =>
          priorityCountryCodes.indexOf(a.toUpperCase()) -
          priorityCountryCodes.indexOf(b.toUpperCase())
      )
      .map(code => ({
        value: createValueFromKeyboard({ layout: code }),
        label: createLabelFromKeyboard(
          { layout: code },
          keyboardsData,
          variantsData
        )
      }))
  },
  {
    label: "Variants (A-Z)",
    options: Object.keys(variantsData)
      .reduce<{ value: string; label: string }[]>(
        (acc, layout) => [
          ...acc,
          ...Object.keys(variantsData[layout]).map(variant => {
            const keyboard = { layout, variant };
            return {
              value: createValueFromKeyboard(keyboard),
              label: createLabelFromKeyboard(
                keyboard,
                keyboardsData,
                variantsData
              )
            };
          })
        ],
        []
      )
      .sort((a, b) => (a.label < b.label ? -1 : 1))
  }
];
