import React, { useState, useEffect } from "react";

import Layout from "../../components/layout/Layout";
import Select from "../../components/atoms/select/Select";

import localeIsSupported from "./helpers/localeIsSupported";
import {
  createOptions,
  createLabelFromLocale,
  americanEnglishLocale,
} from "../../helpers/locales";

import introScreen from "../../assets/images/intro-screen.png";
import styles from "./LanguagePage.module.css";

import { Locale } from "../../types/Locale";
import { GroupedOptionsType } from "react-select";

export enum ErrorMessage {
  UnsupportedLocale = "(Just so you know, some applications may not support that particular language selection. English and Spanish are fully supported)",
  GetLocales = "There was a problem getting your available languages, please press next (you can set your preferred language later)",
  SetLocales = "There was a problem setting your language, please skip (you can set your preferred language later)",
}

export type Props = {
  locales: Locale[];
  currentLocaleCode?: string;
  isGettingLocales: boolean;
  getLocaleCodesError: boolean;
  setLocale: (localeCode: string) => void;
  isSettingLocale: boolean;
  setLocaleError: boolean;
  onSkipClick: () => void;
  alwaysAllowSkip: boolean;
};

export default ({
  locales,
  currentLocaleCode = americanEnglishLocale.localeCode,
  isGettingLocales,
  getLocaleCodesError,
  setLocale,
  isSettingLocale,
  setLocaleError,
  onSkipClick,
  alwaysAllowSkip,
}: Props) => {
  const [selectedLocaleCode, setSelectedLocaleCode] = useState(
    currentLocaleCode
  );
  const [isSupportedLanguage, setIsSupportedLanguage] = useState(true);
  const [options, setOptions] = useState<
    GroupedOptionsType<{
      value: string;
      label: string;
    }>
  >([]);

  const selectedLocale =
    locales.find(({ localeCode }) => localeCode === selectedLocaleCode) ||
    americanEnglishLocale;

  useEffect(() => {
    setSelectedLocaleCode(currentLocaleCode);
  }, [currentLocaleCode]);

  useEffect(() => {
    setIsSupportedLanguage(localeIsSupported(selectedLocaleCode));
  }, [selectedLocaleCode]);

  useEffect(() => {
    setOptions(createOptions(locales));
  }, [locales]);

  let errorMessage = "";
  if (!isSupportedLanguage) {
    errorMessage = ErrorMessage.UnsupportedLocale;
  }

  if (getLocaleCodesError) {
    errorMessage = ErrorMessage.GetLocales;
  }

  if (setLocaleError) {
    errorMessage = ErrorMessage.SetLocales;
  }

  return (
    <Layout
      banner={{
        src: introScreen,
        alt: "language-screen-banner",
      }}
      prompt={
        <>
          Me too! What <span className="green">language</span> shall we use?
        </>
      }
      explanation="Choose your language"
      nextButton={{
        onClick: () => setLocale(selectedLocaleCode),
        disabled: isGettingLocales || isSettingLocale || setLocaleError,
      }}
      skipButton={{ onClick: onSkipClick }}
      showSkip={setLocaleError || alwaysAllowSkip}
      isLoading={isSettingLocale}
      className={styles.root}
    >
      {!isGettingLocales && (
        <Select
          value={{
            value: selectedLocale.localeCode,
            label: createLabelFromLocale(selectedLocale),
          }}
          options={options}
          onChange={(localeCode) => {
            setSelectedLocaleCode(localeCode);
          }}
          isDisabled={isSettingLocale}
        />
      )}

      {errorMessage && (
        <span data-testid="error-message" className={styles.error}>
          {errorMessage}
        </span>
      )}
    </Layout>
  );
};
