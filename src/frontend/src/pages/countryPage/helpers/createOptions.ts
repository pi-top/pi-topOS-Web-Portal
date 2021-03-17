import { getName } from "country-list";
import priorityCountryCodes from "../../../data/priorityCountryCodes.json";

export default (countries: { [s: string]: string }) => [
  {
    label: "Frequently Used",
    options: Object.entries(countries)
      .filter(([countryCode]) => priorityCountryCodes.includes(countryCode))
      .map(([value, backupName]) => ({
        value,
        label: getName(value) || backupName
      }))
      .sort(
        (a, b) =>
          priorityCountryCodes.indexOf(a.value) -
          priorityCountryCodes.indexOf(b.value)
      )
  },
  {
    label: "Remaining (A-Z)",
    options: Object.entries(countries)
      .filter(([countryCode]) => !priorityCountryCodes.includes(countryCode))
      .map(([value, backupName]) => ({
        value,
        label: getName(value) || backupName
      }))
      .sort((a, b) => (a.label < b.label ? -1 : 1))
  }
];
