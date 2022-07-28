import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function stopVncWpaGui() {
    await axios.post(
        `${apiBaseUrl}/stop-vnc-wpa-gui`,
        {}
    );
}
