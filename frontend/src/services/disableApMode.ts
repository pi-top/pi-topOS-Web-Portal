import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function disableApMode() {
    await axios.post(
        `${apiBaseUrl}/disable-ap-mode`,
        {}
    );
}
