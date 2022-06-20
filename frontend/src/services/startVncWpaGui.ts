import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function startVncWpaGui() {
    await axios.post(
        `${apiBaseUrl}/start-vnc-wpa-gui`,
        {}
    );
}
