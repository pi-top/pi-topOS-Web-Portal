import React from "react";
import { render } from "@testing-library/react";

import LandingHeader from "../LandingHeader";

let mockUserAgent = "any-browser";
Object.defineProperty(global.navigator, "userAgent", {
  get() {
    return mockUserAgent;
  },
});

describe("LandingHeader", () => {
  let layout: HTMLElement;
  let queryByAltText: any;
  let queryByText: any;
  let queryByLabelText: any;
  let getByText: any;
  let getByRole: any;
  let rerender: any;
  beforeEach(() => {
    ({
      container: layout,
      queryByAltText,
      queryByText,
      queryByLabelText,
      getByRole,
      getByText,
      rerender,
    } = render(<LandingHeader />));
  });

  it("renders header", () => {
    expect(layout.querySelector(".header")).toMatchSnapshot();
  });

  it("renders prompt message", () => {
    expect(layout.querySelector(".logoContainer")).toMatchSnapshot();
  });
});
