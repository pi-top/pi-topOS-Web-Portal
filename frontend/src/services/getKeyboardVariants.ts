import api from "./api";

import { KeyboardVariantsData } from "../types/Keyboard";

export default async function getKeyboards() {
  const { data } = await api.get<KeyboardVariantsData>(
    `/list-keyboard-layout-variants`,
  );

  return data;
}
