import api from "./api";

export default async function setLocale(locale_code: string) {
  await api.post(`/set-locale`, {
    locale_code,
  });
}
