import api from "./api";

export default async function setCountry(wifi_country: string) {
  await api.post(`/set-wifi-country`, {
    wifi_country,
  });
}
