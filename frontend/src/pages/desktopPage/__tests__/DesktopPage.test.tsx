import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  wait,
  screen,
} from "@testing-library/react";

import DesktopPage, { Props, errorMessage } from "../DesktopPage";
import querySpinner from "../../../../test/helpers/querySpinner";


describe("DesktopPage", () => {
  let desktopPage: HTMLElement;
  let defaultProps: Props;
  let queryByAltText: any;
  let queryByText: any;
  let queryByLabelText: any;
  let queryByTestId: any;
  let getByText: any;
  let rerender: any;

  beforeEach(() => {
    defaultProps = {
      url: "",
      error: false
    };

    ({
      container: desktopPage,
      queryByAltText,
      queryByText,
      queryByLabelText,
      queryByTestId,
      getByText,
      rerender,
    } = render(<DesktopPage {...defaultProps} />));
  })

  it("renders a spinner on mount", () => {
    expect(querySpinner(desktopPage)).toBeInTheDocument();
  });

  describe("on error", () => {
    beforeEach(() => {
      defaultProps = {
        url: "",
        error: true,
      };

      rerender(<DesktopPage {...defaultProps} />);
    })

    it("renders the correct message", async () => {
      expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    });

    it("doesn't render a spinner", () => {
      expect(querySpinner(desktopPage)).not.toBeInTheDocument();
    });

  });

  describe("when an URL is received", () => {
    beforeEach(() => {
      defaultProps = {
        url: "http://pi-top.com",
        error: true,
      };

      rerender(<DesktopPage {...defaultProps} />);
    })

    it("renders an iframe", () => {
      expect(queryByTestId("vnc-desktop")).toBeInTheDocument();
    });

    it("iframe opens the provided url", () => {
      expect(queryByTestId("vnc-desktop")).toMatchSnapshot();
    });

    it("doesn't render a spinner", () => {
      expect(querySpinner(desktopPage)).not.toBeInTheDocument();
    });

    it("doesn't render an error message", async () => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

  });

});
