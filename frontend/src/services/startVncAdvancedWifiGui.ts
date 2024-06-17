import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function startVncAdvancedWifiGui() {
    await axios.post(
        `${apiBaseUrl}/start-vnc-wifi-advanced-connection`,
        {}
    );
}
