import { Timezone } from "../../../types/Timezone";

export default (countryCode: string, timezones: Timezone[]) =>
  timezones
    .filter(timezone => timezone.countryCode === countryCode)
    .map(({ timezone }) => timezone);
