import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function updateEeprom() {
    await axios.post(
        `${apiBaseUrl}/update-eeprom`,
        {}
    );
}
