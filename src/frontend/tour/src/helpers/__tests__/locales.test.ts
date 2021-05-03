import {
  createLabelFromLocale,
  createLocaleFromCode,
  americanEnglishLocale,
  createOptions,
  compareLocales,
} from "../locales";
import { Locale } from "../../types/Locale";

import priorityLocaleCodes from "../../data/priorityLocaleCodes.json";
import localesByCode from "./data/localesByCode.json";
import labelsByCode from "./data/labelsByCode.json";
import locales from "./data/locales.json";
import localesOptions from "./data/localesOptions.json";

describe("locales helpers", () => {
  it("americanEnglishLocale as expected", () => {
    expect(americanEnglishLocale).toEqual({
      localeCode: "en_US",
      nativeLanguageName: "English",
      country: "United States of America",
    });
  });

  describe("#createLocaleFromCode", () => {
    it("returns correct schema when accidentally passed nothing", () => {
      // @ts-ignore
      expect(createLocaleFromCode()).toEqual({
        localeCode: "",
        country: "",
        nativeLanguageName: "",
      });
    });

    Object.entries(localesByCode).forEach(([localeCode, locale]) => {
      it(`Creates locale as expected from ${localeCode}`, () => {
        expect(createLocaleFromCode(localeCode)).toEqual(locale);
      });
    });
  });

  describe("#compareLocales", () => {
    priorityLocaleCodes.forEach((higherPriorityLocaleCode, i) => {
      const lowerPriorityLocaleCode = priorityLocaleCodes[i + 1];
      // @ts-ignore
      const higherPriorityLocale = localesByCode[
        higherPriorityLocaleCode
      ] as Locale;
      // @ts-ignore
      const lowerPriorityLocale = localesByCode[
        lowerPriorityLocaleCode
      ] as Locale;

      if (lowerPriorityLocaleCode) {
        it(`chooses higher priority ${higherPriorityLocaleCode} over lower priority ${lowerPriorityLocaleCode}`, () => {
          expect(
            compareLocales(higherPriorityLocale, lowerPriorityLocale)
          ).toEqual(-1);

          expect(
            compareLocales( lowerPriorityLocale, higherPriorityLocale)
          ).toEqual(1);
        });
      }
    });

    it(`chooses priority country over other countries`, () => {
      // @ts-ignore
      const higherPriorityLocale = localesByCode["en_US"] as Locale;
      // @ts-ignore
      const otherLocale = localesByCode["nn_NO"] as Locale;

      expect(
        compareLocales(higherPriorityLocale, otherLocale)
      ).toEqual(-1);

      expect(
        compareLocales(otherLocale, higherPriorityLocale)
      ).toEqual(1);
    });
  });

  describe("#createLabelFromLocale", () => {
    it("returns correct schema when accidentally passed nothing", () => {
      // @ts-ignore
      expect(createLabelFromLocale()).toEqual("");
    });

    Object.entries(labelsByCode).forEach(([localeCode, label]) => {
      it(`Creates labele as expected for locale ${localeCode}`, () => {
        // @ts-ignore
        expect(createLabelFromLocale(localesByCode[localeCode])).toEqual(label);
      });
    });
  });

  describe("#createOptions", () => {
    it("returns correct schema if accidentally passed nothing", () => {
      // @ts-ignore
      expect(createOptions()).toEqual([
        {
          label: "Frequently used Languages",
          options: [],
        },
        {
          label: "Remaining Languages (A-Z)",
          options: [],
        },
      ]);
    });

    it("creates options correctly", () => {
      expect(createOptions(locales)).toEqual(localesOptions);
    });
  });
});
