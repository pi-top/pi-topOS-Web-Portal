import React, { useState, useEffect } from "react";

import LanguagePage from "./LanguagePage";
import { Locale } from "../../types/Locale";
import getLocales from "../../services/getLocales";
import setLocale from "../../services/setLocale";
import getCurrentLocale from "../../services/getCurrentLocale";
import { getCountryCode } from "../../helpers/locales";

export type Props = {
  goToNextPage: () => void;
  setExpectedUserCountry: (country: string) => void;
  isCompleted: boolean;
};

export default ({
  goToNextPage,
  setExpectedUserCountry,
  isCompleted,
}: Props) => {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [currentLocaleCode, setCurrentLocaleCode] = useState<string>();
  const [isGettingLocales, setIsGettingLocales] = useState(false);
  const [getLocaleCodesError, setGetLocaleCodesError] = useState(false);
  const [isSettingLocale, setIsSettingLocale] = useState(false);
  const [setLocaleError, setSetLocaleError] = useState(false);

  useEffect(() => {
    setIsGettingLocales(true);

    Promise.all([
      getLocales()
        .then(setLocales)
        .catch(() => setGetLocaleCodesError(true)),
      getCurrentLocale().then(setCurrentLocaleCode),
    ])
      .catch(() => null)
      .finally(() => setIsGettingLocales(false));
  }, []);

  return (
    <LanguagePage
      locales={locales}
      currentLocaleCode={currentLocaleCode}
      isGettingLocales={isGettingLocales}
      getLocaleCodesError={getLocaleCodesError}
      setLocale={(localeCode) => {
        setIsSettingLocale(true);

        if (localeCode === currentLocaleCode) {
          setExpectedUserCountry(getCountryCode(localeCode));
          return goToNextPage();
        }

        setLocale(localeCode)
          .then(() => {
            setExpectedUserCountry(getCountryCode(localeCode));
            goToNextPage();
          })
          .catch(() => {
            setSetLocaleError(true);
            setIsSettingLocale(false);
          });
      }}
      isSettingLocale={isSettingLocale}
      setLocaleError={setLocaleError}
      onSkipClick={goToNextPage}
      alwaysAllowSkip={isCompleted}
    />
  );
};
