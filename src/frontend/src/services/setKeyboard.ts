import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

import { Keyboard } from '../types/Keyboard';

export default async function setKeyboard(keyboard: Keyboard) {
  await axios.post(`${apiBaseUrl}/set-keyboard-layout`, keyboard);
}
