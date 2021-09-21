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


import triggerReadyToBeAMakerEvent from "../../../services/triggerReadyToBeAMakerEvent";
jest.mock("../../../services/triggerReadyToBeAMakerEvent");
const triggerReadyToBeAMakerEventMock = triggerReadyToBeAMakerEvent as jest.Mock;

import SplashPage, { Props } from "../SplashPage";

describe("SplashPage", () => {
  let defaultProps: Props;
  let languagePage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  beforeEach(() => {
    triggerReadyToBeAMakerEventMock.mockResolvedValue("OK");

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

  it("calls triggerReadyToBeAMakerEvent on yes button click", () => {
    fireEvent.click(getByText("Yes"));

    expect(triggerReadyToBeAMakerEventMock).toHaveBeenCalled();
  });

  it("calls goToNextPage on yes button click", async () => {
    await wait();
    fireEvent.click(getByText("Yes"));

    await wait();
    expect(defaultProps.goToNextPage).toHaveBeenCalled();
  });

  describe('if triggerReadyToBeAMakerEvent service fails', () => {
    beforeEach(() => {
      triggerReadyToBeAMakerEventMock.mockRejectedValue(new Error("Oh oh, something happened"))
    });

    it("still calls goToNextPage", async () => {
      await wait();
      fireEvent.click(getByText("Yes"));

      await wait();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  })
});
