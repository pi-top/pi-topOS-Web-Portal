import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enableOSUpdaterService() {
    await axios.post(
        `${apiBaseUrl}/enable-os-updater-service`,
        {}
    );
}
