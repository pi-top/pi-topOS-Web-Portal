import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function startRoverController() {
    await axios.post(
        `${apiBaseUrl}/rover-controller-start`,
        {}
    );
}
