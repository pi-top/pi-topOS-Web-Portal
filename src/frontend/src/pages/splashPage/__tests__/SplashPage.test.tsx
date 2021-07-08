import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
} from "@testing-library/react";

import SplashPage, { Props } from "../SplashPage";

describe("SplashPage", () => {
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
    } = render(<SplashPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("intro-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = languagePage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders Yes button", () => {
    expect(queryByText("Yes")).toBeInTheDocument();
  });

  it("calls goToNextPage on yes button click", () => {
    fireEvent.click(getByText("Yes"));

    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });
});
