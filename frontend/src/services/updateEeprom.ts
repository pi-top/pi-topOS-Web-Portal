import api from "./api";

export default async function updateEeprom() {
  await api.post(`/update-eeprom`, {});
}
