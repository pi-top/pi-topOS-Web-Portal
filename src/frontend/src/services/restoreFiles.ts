import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function restoreFiles() {
    await axios.post(
        `${apiBaseUrl}/restore-files`,
        {}
    );
}
