import LocaleCode from "locale-code";

export default (localeCode: string) => {
  switch(LocaleCode.getLanguageCode(localeCode.replace('_', '-'))) {
    case 'en':
    case 'es': return true;
    default: return false;
  }
}
