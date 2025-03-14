import api from "./api";
import LocaleCode from "locale-code";
import { getName } from "country-list";

import { Locale } from "../types/Locale";

export default async function getLocales() {
  const { data } = await api.get<string[]>(`/list-locales-supported`);

  const rawLocales: {
    localeCode: string;
    country?: string;
    nativeLanguageName?: string;
  }[] = data.map((localeCode) => {
    const formattedCode = localeCode.replace("_", "-");
    const countryCode = LocaleCode.getCountryCode(formattedCode);

    return {
      localeCode,
      country: getName(countryCode),
      nativeLanguageName: LocaleCode.getLanguageNativeName(formattedCode),
    };
  });

  const validLocales = rawLocales.filter(
    ({ country, nativeLanguageName }) => !!(country && nativeLanguageName),
  ) as Locale[];

  const uniqueLocales = validLocales.filter(
    ({ country, nativeLanguageName }, index, locales) =>
      locales.findIndex(
        (locale) =>
          locale.country === country &&
          nativeLanguageName === locale.nativeLanguageName,
      ) === index,
  );

  return uniqueLocales;
}
