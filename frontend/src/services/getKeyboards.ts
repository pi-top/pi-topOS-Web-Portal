import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { KeyboardsData } from '../types/Keyboard';

export default async function getKeyboards() {
  const { data } = await axios.get<KeyboardsData>(
    `${apiBaseUrl}/list-keyboard-layout-codes`
  );

  return data;
}
