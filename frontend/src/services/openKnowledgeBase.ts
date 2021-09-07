 import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";

export default async function openKnowledgeBase() {
  await axios.post(
    `${apiBaseUrl}/open-knowledge-base`,
    {}
  );
}
