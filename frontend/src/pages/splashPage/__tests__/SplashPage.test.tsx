import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  wait,
} from "@testing-library/react";


import leaveMiniscreenAppBreadcrumb from "../../../services/leaveMiniscreenAppBreadcrumb";
jest.mock("../../../services/leaveMiniscreenAppBreadcrumb");
const leaveMiniscreenAppBreadcrumbMock = leaveMiniscreenAppBreadcrumb as jest.Mock;

import SplashPage, { Props } from "../SplashPage";

describe("SplashPage", () => {
  let defaultProps: Props;
  let languagePage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  beforeEach(() => {
    leaveMiniscreenAppBreadcrumbMock.mockResolvedValue("OK");

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

  it("calls leaveMiniscreenAppBreadcrumb on yes button click", () => {
    fireEvent.click(getByText("Yes"));

    expect(leaveMiniscreenAppBreadcrumbMock).toHaveBeenCalled();
  });

  it("calls goToNextPage on yes button click", async () => {
    await wait();
    fireEvent.click(getByText("Yes"));

    await wait();
    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });

  describe('if leaveMiniscreenAppBreadcrumb service fails', () => {
    beforeEach(() => {
      leaveMiniscreenAppBreadcrumbMock.mockRejectedValue(new Error("Oh oh, something happened"))
    });

    it("still calls goToNextPage", async () => {
      await wait();
      fireEvent.click(getByText("Yes"));

      await wait();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  })
});
