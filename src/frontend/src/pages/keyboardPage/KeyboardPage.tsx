import React, { useState, useEffect } from "react";

import Layout from "../../components/layout/Layout";
import Select from "../../components/atoms/select/Select";
import Input from "../../components/atoms/input/Input";

import keyboardScreen from "../../assets/images/keyboard-screen.png";
import styles from "./KeyboardPage.module.css";
import {
  Keyboard,
  KeyboardsData,
  KeyboardVariantsData,
} from "../../types/Keyboard";
import {
  createOptions,
  createValueFromKeyboard,
  createKeyboardFromValue,
  createLabelFromKeyboard,
} from "./helpers/keyboardSelect";
import { GroupedOptionsType } from "react-select";
import Spinner from "../../components/atoms/spinner/Spinner";

export enum ErrorMessage {
  GetKeyboards = "There was a problem getting possible keyboards, please press next (you can set your keyboard layout later)",
  SetKeyboard = "There was a problem setting your selected keyboard, please skip (you can set your preferred keyboard layout later)",
}

export type Props = {
  keyboards: KeyboardsData;
  keyboardVariants: KeyboardVariantsData;
  currentKeyboard: Keyboard;
  isGettingKeyboards: boolean;
  getKeyboardsError: boolean;
  setKeyboard: (keyboard: Keyboard) => void;
  settingKeyboard: Keyboard | null;
  setKeyboardError: boolean;
  onBackClick: () => void;
  onSkipClick: () => void;
  onNextClick: () => void;
  alwaysAllowSkip: boolean;
};

export default ({
  keyboards,
  keyboardVariants,
  currentKeyboard,
  isGettingKeyboards,
  getKeyboardsError,
  setKeyboard,
  settingKeyboard,
  setKeyboardError,
  onBackClick,
  onSkipClick,
  onNextClick,
  alwaysAllowSkip,
}: Props) => {
  const [selectOptions, setSelectOptions] = useState<
    GroupedOptionsType<{
      value: string;
      label: string;
    }>
  >(createOptions(keyboards, keyboardVariants));

  useEffect(() => {
    setSelectOptions(createOptions(keyboards, keyboardVariants));
  }, [keyboards, keyboardVariants]);

  let errorMessage = "";
  if (getKeyboardsError) {
    errorMessage = ErrorMessage.GetKeyboards;
  }

  if (setKeyboardError) {
    errorMessage = ErrorMessage.SetKeyboard;
  }

  return (
    <Layout
      banner={{
        src: keyboardScreen,
        alt: "keyboard-screen",
      }}
      prompt={
        <>
          QWERTY, <span className="green">or something else?</span>
        </>
      }
      explanation="Which keyboard layout would you like to use?"
      nextButton={{
        onClick: onNextClick,
        disabled: isGettingKeyboards || !!settingKeyboard || setKeyboardError,
      }}
      backButton={{
        onClick: onBackClick,
      }}
      skipButton={{ onClick: onSkipClick }}
      showSkip={setKeyboardError || alwaysAllowSkip}
      className={styles.root}
    >
      {!isGettingKeyboards && (
        <>
          <div className={styles.keyboardSelectContainer}>
            <Select
              value={{
                value: createValueFromKeyboard(
                  settingKeyboard || currentKeyboard
                ),
                label: createLabelFromKeyboard(
                  settingKeyboard || currentKeyboard,
                  keyboards,
                  keyboardVariants
                ),
              }}
              options={selectOptions}
              isDisabled={!!settingKeyboard}
              onChange={(value) => {
                const keyboard = createKeyboardFromValue(value);
                if (
                  keyboard.layout !== currentKeyboard.layout ||
                  keyboard.variant !== currentKeyboard.variant
                ) {
                  setKeyboard(keyboard);
                }
              }}
              className={styles.layoutSelect}
            />

            {!!settingKeyboard && (
              <div className={styles.settingIndicator}>
                <Spinner size={20} />{" "}
                <span className={styles.settingMessage}>
                  setting keyboard...
                </span>
              </div>
            )}
          </div>

          <span className={styles.message}>
            Test your keyboard below
            <br />
            <span className={styles.subMessage}>
              Keyboard input over VNC may not be affected
            </span>
          </span>

          <Input
            id="keyboard-test-input"
            placeholder="please try the following keys | @ # / \ ~"
            className={styles.testInput}
          />
        </>
      )}

      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
