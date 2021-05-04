import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enableMouseCursor() {
    await axios.post(
        `${apiBaseUrl}/enable-mouse-cursor`,
        {}
    );
}
