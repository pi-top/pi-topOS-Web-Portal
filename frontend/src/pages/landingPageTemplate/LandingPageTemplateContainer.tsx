import React from "react";
import { LandingPageElement } from "../../components/landing_app/App";

import LandingPageTemplate from "./LandingPageTemplate";

export type Props = {
  page: LandingPageElement;
};

export default ({ page }: Props) => {
  return (
    <LandingPageTemplate
      page={page}
    />
  );
};
