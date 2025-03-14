import api from "./api";

import { Keyboard } from "../types/Keyboard";

export default async function getCurrentKeyboard() {
  const { data } = await api.get<Keyboard>(`/current-keyboard-layout`);

  return data;
}
