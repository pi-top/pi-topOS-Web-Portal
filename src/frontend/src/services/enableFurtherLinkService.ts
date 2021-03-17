import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function enableFurtherLinkService() {
    await axios.post(
        `${apiBaseUrl}/enable-further-link-service`,
        {}
    );
}
