import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enablePtMiniscreen() {
    await axios.post(
        `${apiBaseUrl}/enable-pt-miniscreen`,
        {}
    );
}
