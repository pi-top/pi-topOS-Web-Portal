 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openFurther() {
  await axios.post(
    `${apiBaseUrl}/open-further`,
    {}
  );
}
