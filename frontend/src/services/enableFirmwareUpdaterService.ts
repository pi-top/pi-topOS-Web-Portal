import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enableFirmwareUpdaterService() {
    await axios.post(
        `${apiBaseUrl}/enable-firmware-updater-service`,
        {}
    );
}
