import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { KeyboardVariantsData } from "../types/Keyboard";

export default async function getKeyboards() {
  const { data } = await axios.get<KeyboardVariantsData>(
    `${apiBaseUrl}/list-keyboard-layout-variants`
  );

  return data;
}
