import React from "react";
import { render, GetByText, BoundFunction } from "@testing-library/react";

import PrivacyPolicy from "../PrivacyPolicy";

describe("PrivacyPolicy", () => {
  let getByText: BoundFunction<GetByText>;
  beforeEach(() => {
    ({ getByText } = render(<PrivacyPolicy />));
  });

  it("renders pi-top privacy policy", () => {
    expect(
      getByText("1 WHO WE ARE")
    ).toBeInTheDocument();
  });
});
