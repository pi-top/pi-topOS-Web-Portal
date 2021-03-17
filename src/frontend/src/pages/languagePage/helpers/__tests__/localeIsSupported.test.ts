import localeIsSupported from "../localeIsSupported";
import supportedLocales from './data/supportedLocales.json';
import unsupportedLocales from './data/unsupportedLocales.json';

describe("localeIsSupported", () => {
  supportedLocales.forEach(locale =>
    it(`returns true for supported locale: ${locale}`, () => {
      expect(localeIsSupported(locale)).toEqual(true);
    })
  );

  unsupportedLocales.forEach(locale =>
    it(`returns false for unsupported locale: ${locale}`, () => {
      expect(localeIsSupported(locale)).toEqual(false);
    })
  );
});
