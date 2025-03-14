import api from "./api";

import { KeyboardsData } from "../types/Keyboard";

export default async function getKeyboards() {
  const { data } = await api.get<KeyboardsData>(`/list-keyboard-layout-codes`);

  return data;
}
