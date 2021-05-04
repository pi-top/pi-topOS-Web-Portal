import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { Keyboard } from '../types/Keyboard';

export default async function getCurrentKeyboard() {
  const { data } = await axios.get<Keyboard>(
    `${apiBaseUrl}/current-keyboard-layout`
  );

  return data;
}
