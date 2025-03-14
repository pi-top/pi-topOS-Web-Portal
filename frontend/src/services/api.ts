import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});
