import LocaleCode from "locale-code";
import { getName } from "country-list";
import { Locale } from "../types/Locale";
import priorityLocaleCodes from "../data/priorityLocaleCodes.json";

export const createLocaleFromCode: (localeCode: string) => Locale = (
  localeCode = ""
) => {
  const formattedCode = localeCode.replace("_", "-");
  const countryCode = LocaleCode.getCountryCode(formattedCode);

  return {
    localeCode,
    country: getName(countryCode) || "",
    nativeLanguageName: LocaleCode.getLanguageNativeName(formattedCode),
  };
};

export const americanEnglishLocale: Locale = {
  localeCode: "en_US",
  nativeLanguageName: LocaleCode.getLanguageNativeName("en-US"),
  country: getName("US") || "United States of America",
};

export const compareLocales = (a: Locale, b: Locale) => {
  const aIndex = priorityLocaleCodes.indexOf(a.localeCode);
  const bIndex = priorityLocaleCodes.indexOf(b.localeCode);

  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  }

  if (aIndex !== -1) {
    return -1;
  }

  if (bIndex !== -1) {
    return 1;
  }

  if (a.nativeLanguageName === b.nativeLanguageName) {
    return a.localeCode < b.localeCode? -1 : 1
  }

  return a.nativeLanguageName < b.nativeLanguageName ? -1 : 1;
};

export const createLabelFromLocale = (locale: Locale) => {
  if (!locale) {
    return "";
  }

  return `${locale.nativeLanguageName} (${locale.country})`;
};

export const createOptions = (locales: Locale[] = []) => [
  {
    label: "Frequently used Languages",
    options: locales
      .filter((locale) => priorityLocaleCodes.includes(locale.localeCode))
      .sort(compareLocales)
      .map((locale) => ({
        value: locale.localeCode,
        label: createLabelFromLocale(locale),
      })),
  },
  {
    label: "Remaining Languages (A-Z)",
    options: locales
      .filter((locale) => !priorityLocaleCodes.includes(locale.localeCode))
      .sort(compareLocales)
      .map((locale) => ({
        value: locale.localeCode,
        label: createLabelFromLocale(locale),
      })),
  },
];

export const getCountryCode = (localeCode: string) =>
  LocaleCode.getCountryCode(localeCode.replace("_", "-"));
