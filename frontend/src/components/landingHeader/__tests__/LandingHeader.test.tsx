import React from "react";
import { fireEvent, getByRole, render } from "@testing-library/react";

import LandingHeader from "../LandingHeader";
import closePtOsLandingWindow from "../../../services/closePtOsLandingWindow";

jest.mock("../../../services/closePtOsLandingWindow");

const closePtOsLandingWindowMock = closePtOsLandingWindow as jest.Mock;

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
    closePtOsLandingWindowMock.mockResolvedValue("OK");
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

  it("doesn't render close button (on regular browser)", () => {
    expect(layout.querySelector(".closeButtonDiv")).not.toBeInTheDocument();
  });

  describe("when running app on web-renderer", () => {
    beforeEach(() => {
        mockUserAgent = "web-renderer";
        rerender(<LandingHeader />);
    })

    it("renders close button (on regular browser)", () => {
      expect(layout.querySelector(".closeButtonDiv")).toBeInTheDocument();
    });

    it("closes landing app window when clicking close button", () => {
      fireEvent.click(getByRole("button", "close-window"));
      expect(closePtOsLandingWindowMock).toHaveBeenCalled();
    });

  });

});
