import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function stopRoverController() {
    await axios.post(
        `${apiBaseUrl}/rover-controller-stop`,
        {}
    );
}
