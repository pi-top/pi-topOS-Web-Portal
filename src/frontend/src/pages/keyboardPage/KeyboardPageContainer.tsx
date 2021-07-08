import React, { useState, useEffect, useCallback } from "react";

import KeyboardPage from "./KeyboardPage";
import getKeyboards from "../../services/getKeyboards";
import getKeyboardVariants from "../../services/getKeyboardVariants";
import setKeyboardService from "../../services/setKeyboard";
import getCurrentKeyboard from "../../services/getCurrentKeyboard";

import {
  Keyboard,
  KeyboardsData,
  KeyboardVariantsData
} from "../../types/Keyboard";

export type Props = {
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  isCompleted: boolean;
};

export default ({ goToNextPage, goToPreviousPage, isCompleted }: Props) => {
  const [keyboards, setKeyboards] = useState<KeyboardsData>({});
  const [keyboardVariants, setKeyboardVariants] = useState<
    KeyboardVariantsData
  >({});
  const [currentKeyboard, setCurrentKeyboard] = useState<Keyboard>({
    layout: ""
  });
  const [isGettingKeyboards, setIsGettingKeyboards] = useState(true);
  const [getKeyboardsError, setGetKeyboardsError] = useState(false);
  const [settingKeyboard, setSettingKeyboard] = useState<Keyboard | null>(null);
  const [setKeyboardError, setSetKeyboardError] = useState(false);
  const setKeyboard = useCallback(keyboard => {
    setSettingKeyboard(keyboard);
    setSetKeyboardError(false);

    setKeyboardService(keyboard)
      .then(() => setCurrentKeyboard(keyboard))
      .catch(() => setSetKeyboardError(true))
      .finally(() => setSettingKeyboard(null));
  }, []);

  useEffect(() => {
    Promise.all([
      getKeyboards().then(getKeyboardsResponse =>
        setKeyboards(getKeyboardsResponse)
      ),
      getKeyboardVariants().then(getKeyboardVariantsResonse =>
        setKeyboardVariants(getKeyboardVariantsResonse)
      ),
      getCurrentKeyboard()
        .then(getCurrentKeyboardResponse =>
          setCurrentKeyboard(getCurrentKeyboardResponse)
        )
        .catch(() => null) // don't alert the user if current not found
    ])
      .catch(() => {
        setGetKeyboardsError(true);
      })
      .finally(() => setIsGettingKeyboards(false));
  }, []);

  return (
    <KeyboardPage
      keyboards={keyboards}
      keyboardVariants={keyboardVariants}
      currentKeyboard={currentKeyboard}
      isGettingKeyboards={isGettingKeyboards}
      getKeyboardsError={getKeyboardsError}
      setKeyboard={setKeyboard}
      settingKeyboard={settingKeyboard}
      setKeyboardError={setKeyboardError}
      onBackClick={goToPreviousPage}
      onNextClick={goToNextPage}
      onSkipClick={goToNextPage}
      alwaysAllowSkip={isCompleted}
    />
  );
};
