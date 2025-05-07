import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  QueryByBoundAttribute,
} from "@testing-library/react";

import FinalOnboardingPage, { Props } from "../FinalOnboardingPage";

describe("FinalOnboardingPage", () => {
  let defaultProps: Props;
  let finalOnboardingPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  beforeEach(() => {
    defaultProps = {
      onBackClick: jest.fn(),
      onNextClick: jest.fn(),
    };

    ({
      container: finalOnboardingPage,
      getByAltText,
      queryByText,
      queryByTestId,
      getByText,
    } = render(<FinalOnboardingPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("final-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = finalOnboardingPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("doesn't render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders finish button", () => {
    expect(queryByText("Finish")).toBeInTheDocument();
  });

  it("renders back button", () => {
    expect(queryByText("Back")).toBeInTheDocument();
  });

  it("doesn't render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("Back button isn't disabled", () => {
    expect(getByText("Back")).toHaveProperty("disabled", false);
  });

  it("Finish button isn't disabled", () => {
    expect(getByText("Finish").parentElement).toHaveProperty("disabled", false);
  });

  it("calls onBackClick on back button click", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.onBackClick).toHaveBeenCalled();
  });

  it("calls onNextClick on finish button click", () => {
    fireEvent.click(getByText("Finish"));

    expect(defaultProps.onNextClick).toHaveBeenCalled();
  });
});
