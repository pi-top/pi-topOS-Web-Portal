import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function updateHubFirmware() {
    await axios.post(
        `${apiBaseUrl}/update-hub-firmware`,
        {}
    );
}
