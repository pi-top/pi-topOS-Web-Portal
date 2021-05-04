import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
} from "@testing-library/react";

import TourSplashPage, { Props } from "../TourSplashPage";

describe("TourSplashPage", () => {
  let defaultProps: Props;
  let languagePage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  beforeEach(() => {
    defaultProps = {
      goToNextPage: jest.fn(),
    };

    ({
      container: languagePage,
      getByAltText,
      queryByText,
      getByText,
    } = render(<TourSplashPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("tour-intro-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = languagePage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders Yes button", () => {
    expect(queryByText("Let's Go")).toBeInTheDocument();
  });

  it("calls goToNextPage on yes button click", () => {
    fireEvent.click(getByText("Let's Go"));

    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });
});
