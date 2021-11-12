import axios from "axios";

import apiBaseUrl from "./apiBaseUrl";
import { LandingElement } from "../components/landingContainer/LandingContainer";

export default async function getLandingPageElements() {
  const { data } = await axios.get<LandingElement[]>(
    `${apiBaseUrl}/landing-page-elements`
  );

  return data;
}
