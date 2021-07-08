import { useState, useEffect } from "react";
import { getName } from "country-list";

import Layout from "../../components/layout/Layout";
import Select from "../../components/atoms/select/Select";

import countryScreen from "../../assets/images/country-screen.png";
import styles from "./CountryPage.module.css";
import { Timezone } from "../../types/Timezone";
import createLabelFromTimezone from "./helpers/createLabelFromTimezone";
import getTimezonesForCountry from "./helpers/getTimezonesForCountry";
import createOptions from "./helpers/createOptions";
import { GroupedOptionsType } from "react-select";

export enum ErrorMessage {
  GetCountries = "There was a problem getting possible countries, please press next (you can set your location later)",
  SetCountry = "There was a problem setting your country, please skip (you can set your preferred location later)",
}

export type Props = {
  currentCountryCode: string;
  countries: { [s: string]: string };
  currentTimezoneCode: string;
  timezones: Timezone[];
  isGettingCountries: boolean;
  getCountriesError: boolean;
  setCountryAndTimezone: (countryCode: string, timezoneCode: string) => void;
  isSetting: boolean;
  setError: boolean;
  onBackClick: () => void;
  onSkipClick: () => void;
  alwaysAllowSkip: boolean;
};

export default ({
  currentCountryCode,
  countries,
  currentTimezoneCode,
  timezones,
  isGettingCountries,
  getCountriesError,
  setCountryAndTimezone,
  isSetting,
  setError,
  onBackClick,
  onSkipClick,
  alwaysAllowSkip,
}: Props) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    currentCountryCode
  );
  const [possibleTimezones, setPossibleTimezones] = useState(
    getTimezonesForCountry(selectedCountryCode, timezones)
  );
  const [selectedTimezoneCode, setSelectedTimezoneCode] = useState(
    currentTimezoneCode
  );
  const [selectOptions, setSelectOptions] = useState<
    GroupedOptionsType<{
      value: string;
      label: string;
    }>
  >(createOptions(countries));

  useEffect(() => {
    setSelectedCountryCode(currentCountryCode);
  }, [currentCountryCode]);

  useEffect(() => {
    setSelectedTimezoneCode(currentTimezoneCode);
  }, [currentTimezoneCode]);

  useEffect(() => {
    setSelectOptions(createOptions(countries));
  }, [countries]);

  useEffect(() => {
    if (timezones.length) {
      const countryTimezones = getTimezonesForCountry(
        selectedCountryCode,
        timezones
      );

      setPossibleTimezones(countryTimezones);
      setSelectedTimezoneCode(
        countryTimezones.includes(currentTimezoneCode)
          ? currentTimezoneCode
          : countryTimezones[0]
      );
    }
  }, [timezones, selectedCountryCode, currentTimezoneCode]);

  let errorMessage = "";
  if (getCountriesError) {
    errorMessage = ErrorMessage.GetCountries;
  }

  if (setError) {
    errorMessage = ErrorMessage.SetCountry;
  }

  return (
    <Layout
      banner={{
        src: countryScreen,
        alt: "country-screen",
      }}
      prompt={
        <>
          Ok, now where <span className="green">in the world</span> are we?
        </>
      }
      explanation="Choose the country we’re in from the list below."
      nextButton={{
        onClick: () =>
          setCountryAndTimezone(selectedCountryCode, selectedTimezoneCode),
        disabled: isGettingCountries || isSetting || setError,
      }}
      backButton={{
        onClick: onBackClick,
      }}
      skipButton={{ onClick: onSkipClick }}
      showSkip={setError || alwaysAllowSkip}
      className={styles.root}
    >
      {!isGettingCountries && (
        <>
          <Select
            value={{
              value: selectedCountryCode,
              label:
                getName(selectedCountryCode) || countries[selectedCountryCode],
            }}
            onChange={(countryCode) => setSelectedCountryCode(countryCode)}
            options={selectOptions}
            isDisabled={isSetting}
          />

          <div className={styles.timezoneContainer}>
            <span className={styles.message}>Timezone</span>

            <Select
              key={`timezone-select-${selectedTimezoneCode}`} // force rerender on selection change
              label="Please select your timezone"
              value={{
                value: selectedTimezoneCode,
                label: createLabelFromTimezone(selectedTimezoneCode),
              }}
              options={possibleTimezones
                .map((timezone) => ({
                  value: timezone,
                  label: createLabelFromTimezone(timezone),
                }))
                .sort((a, b) => (a.label < b.label ? -1 : 1))} // sort alphabetically
              onChange={(timezone) => {
                setSelectedTimezoneCode(timezone);
              }}
              isDisabled={isSetting}
            />
          </div>
        </>
      )}

      {errorMessage && <span className={styles.error}>{errorMessage}</span>}
    </Layout>
  );
};
