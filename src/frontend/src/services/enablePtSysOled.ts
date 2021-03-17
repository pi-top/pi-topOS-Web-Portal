import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enablePtSysOled() {
    await axios.post(
        `${apiBaseUrl}/enable-pt-sys-oled`,
        {}
    );
}
