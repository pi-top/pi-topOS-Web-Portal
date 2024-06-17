import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function stopVncAdvancedWifiGui() {
    await axios.post(
        `${apiBaseUrl}/stop-vnc-wifi-advanced-connection`,
        {}
    );
}
