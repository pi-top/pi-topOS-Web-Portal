import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  RenderResult,
} from "@testing-library/react";

import TermsPage, { Props } from "../TermsPage";

describe("TermsPage", () => {
  let defaultProps: Props;
  let termsPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      acceptTerms: jest.fn(),
      onBackClick: jest.fn(),
      onSkipClick: jest.fn(),
      alwaysAllowSkip: false,
    };

    ({
      container: termsPage,
      getByAltText,
      queryByText,
      getByText,
      rerender,
    } = render(<TermsPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("terms-screen-banner")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = termsPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders next button", () => {
    expect(queryByText("Agree")).toBeInTheDocument();
  });

  it("renders back button", () => {
    expect(queryByText("Back")).toBeInTheDocument();
  });

  it("does not render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("calls acceptTerms when next button clicked", () => {
    fireEvent.click(getByText("Agree"));

    expect(defaultProps.acceptTerms).toHaveBeenCalled();
  });

  it("calls onBackClick when back button clicked", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.onBackClick).toHaveBeenCalled();
  });

  it("renders terms and conditions", () => {
    expect(queryByText("pi-topOS End User Licence Agreement (EULA)")).toBeInTheDocument();
  });

  describe('when alwaysAllowSkip is true', () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        alwaysAllowSkip: true,
      }

      rerender(<TermsPage {...defaultProps} />)
    })

    it("renders skip button", () => {
      expect(queryByText("Skip")).toBeInTheDocument();
    });

    it("calls onSkipClick when skip button clicked", () => {
      fireEvent.click(getByText("Skip"));

      expect(defaultProps.onSkipClick).toHaveBeenCalled();
    });
  })
});
