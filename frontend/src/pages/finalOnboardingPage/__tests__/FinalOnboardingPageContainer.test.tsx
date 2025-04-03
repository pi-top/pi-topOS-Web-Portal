import React from "react";
import {
  render,
  BoundFunction,
  QueryByText,
  GetByText,
  RenderResult,
  fireEvent,
  GetByBoundAttribute,
  QueryByBoundAttribute,
} from "@testing-library/react";

import FinalOnboardingPageContainer, { Props } from "../FinalOnboardingPageContainer";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

describe("FinalOnboardingPageContainer", () => {
  let defaultProps: Props;
  let finalOnboardingPageContainer: HTMLElement;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let getByTestId: BoundFunction<GetByBoundAttribute>;
  let rerender: RenderResult["rerender"];

  beforeEach(async () => {
    defaultProps = {};

    ({
      container: finalOnboardingPageContainer,
      queryByText,
      getByText,
      rerender,
      queryByTestId,
      getByTestId,
    } = render(<FinalOnboardingPageContainer {...defaultProps} />));
  });

  it("renders back button", () => {
    expect(getByText("Back")).toBeInTheDocument();
  });

  it("renders finish button", () => {
    expect(getByText("Finish")).toBeInTheDocument();
  });

  it("does not render error message", () => {
    expect(
      finalOnboardingPageContainer.querySelector(".error")
    ).not.toBeInTheDocument();
  });

  it("renders prompt correctly", async () => {
    expect(finalOnboardingPageContainer.querySelector(".prompt")).toMatchSnapshot();
  });

  describe("when goToPreviousPage is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        goToPreviousPage: jest.fn(),
      };

      rerender(<FinalOnboardingPageContainer {...defaultProps} />);
    });

    it("renders back button", () => {
      expect(queryByText("Back")).toBeInTheDocument();
    });

    it("calls goToPreviousPage on back button click", () => {
      fireEvent.click(getByText("Back"));

      expect(defaultProps.goToPreviousPage).toHaveBeenCalled();
    });
  });

  describe("when goToNextPage is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        goToNextPage: jest.fn(),
      };

      rerender(<FinalOnboardingPageContainer {...defaultProps} />);
    });

    it("renders Finish button", () => {
      expect(getByText("Finish")).toBeInTheDocument();
    });

    it("calls goToNextPage on Finish button click", () => {
      fireEvent.click(getByText("Finish"));

      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  });
});
