import api from "./api";

import { Keyboard } from "../types/Keyboard";

export default async function setKeyboard(keyboard: Keyboard) {
  await api.post(`/set-keyboard-layout`, keyboard);
}
