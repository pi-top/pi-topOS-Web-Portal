import React, { useState, useEffect } from "react";

import { Timezone } from "../../types/Timezone";
import CountryPage from "./CountryPage";
import getCountries from "../../services/getCountries";
import setCountry from "../../services/setCountry";
import getCurrentCountry from "../../services/getCurrentCountry";
import getTimezones from "../../services/getTimezones";
import getCurrentTimezone from "../../services/getCurrentTimezone";
import setTimezone from "../../services/setTimezone";

export type Props = {
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  isCompleted: boolean;
  defaultCountry: string;
};

export default ({ goToNextPage, goToPreviousPage, isCompleted, defaultCountry }: Props) => {
  const [countries, setCountries] = useState<{ [s: string]: string }>({});
  const [currentCountryCode, setCurrentCountry] = useState<string>("");
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [currentTimezone, setCurrentTimezone] = useState("");
  const [isGettingCountries, setIsGettingCountries] = useState(true);
  const [getCountriesError, setGetCountriesError] = useState(false);
  const [isSetting, setIsSetting] = useState(false);
  const [setError, setSetError] = useState(false);

  useEffect(() => {
    Promise.all([
      getCountries()
        .then(setCountries)
        .catch(() => setGetCountriesError(true)),
      getCurrentCountry().then(setCurrentCountry),
      getTimezones().then(setTimezones),
      getCurrentTimezone().then(setCurrentTimezone)
    ])
      .catch(() => null)
      .finally(() => setIsGettingCountries(false));
  }, []);

  return (
    <CountryPage
      currentCountryCode={currentCountryCode || defaultCountry}
      countries={countries}
      timezones={timezones}
      currentTimezoneCode={currentTimezone}
      isGettingCountries={isGettingCountries}
      getCountriesError={getCountriesError}
      setCountryAndTimezone={(countryCode, timezoneCode) => {
        setIsSetting(true);

        if (
          countryCode === currentCountryCode &&
          timezoneCode === currentTimezone
        ) {
          return goToNextPage();
        }

        Promise.all([setCountry(countryCode), setTimezone(timezoneCode)])
          .then(goToNextPage)
          .catch(() => {
            setSetError(true);
            setIsSetting(false);
          });
      }}
      isSetting={isSetting}
      setError={setError}
      onBackClick={goToPreviousPage}
      onSkipClick={goToNextPage}
      alwaysAllowSkip={isCompleted}
    />
  );
};
