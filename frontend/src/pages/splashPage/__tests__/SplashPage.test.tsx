import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByBoundAttribute,
  QueryByText,
  GetByText,
  wait,
} from "@testing-library/react";

import triggerReadyToBeAMakerEvent from "../../../services/triggerReadyToBeAMakerEvent";
import { runningOnWebRenderer } from "../../../helpers/utils";
jest.mock("../../../services/triggerReadyToBeAMakerEvent");
jest.mock("../../../helpers/utils");
const triggerReadyToBeAMakerEventMock =
  triggerReadyToBeAMakerEvent as jest.Mock;
const runningOnWebRendererMock = runningOnWebRenderer as jest.Mock;

import SplashPage, { Props } from "../SplashPage";

describe("SplashPage", () => {
  let defaultProps: Props;
  let container: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;

  beforeEach(() => {
    triggerReadyToBeAMakerEventMock.mockResolvedValue("OK");
    runningOnWebRendererMock.mockResolvedValue(false);

    defaultProps = {
      goToNextPage: jest.fn(),
    };

    ({
      container,
      getByAltText,
      queryByText,
      getByLabelText,
      queryByTestId,
      getByText,
    } = render(<SplashPage {...defaultProps} />));
  });

  it("renders correct title", () => {
    expect(queryByTestId("choice-title")).toMatchSnapshot();
  });

  it("renders user-type options for user to select", () => {
    expect(queryByTestId("choice-options")).toMatchSnapshot();
  });

  it("Next button is enabled only when a user selection is made", () => {
    // disabled on render
    expect(getByText("Next").parentElement).toHaveProperty("disabled", true);

    // enabled when user selects an option
    fireEvent.click(getByLabelText("Teacher"));
    expect(getByText("Next").parentElement).toHaveProperty("disabled", false);

    // disabled when user selects same option
    fireEvent.click(getByLabelText("Teacher"));
    expect(getByText("Next").parentElement).toHaveProperty("disabled", true);
  });

  describe("if user is a teacher", () => {
    beforeEach(() => {
      fireEvent.click(getByLabelText("Teacher"));
    });

    it("calls goToNextPage when clicking 'yes' button", async () => {
      await wait();
      fireEvent.click(getByText("Next"));

      await wait();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("calls triggerReadyToBeAMakerEvent on next button click", () => {
      fireEvent.click(getByText("Next"));

      expect(triggerReadyToBeAMakerEventMock).toHaveBeenCalled();
    });
  });

  describe("if user is a home user", () => {
    beforeEach(() => {
      fireEvent.click(getByLabelText("Home"));
    });

    it("calls goToNextPage when clicking 'yes' button", async () => {
      await wait();
      fireEvent.click(getByText("Next"));

      await wait();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("calls triggerReadyToBeAMakerEvent on next button click", () => {
      fireEvent.click(getByText("Next"));

      expect(triggerReadyToBeAMakerEventMock).toHaveBeenCalled();
    });
  });

  describe("if onboarding on device", () => {
    beforeEach(() => {
      runningOnWebRendererMock.mockResolvedValue(true);
    });

    it("calls goToNextPage on render", async () => {
      await wait();
      expect(triggerReadyToBeAMakerEventMock).toHaveBeenCalled();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });

    it("sets ready to be a maker event on render", async () => {
      await wait();
      expect(triggerReadyToBeAMakerEventMock).toHaveBeenCalled();
    });
  });

  describe("if triggerReadyToBeAMakerEvent service fails", () => {
    beforeEach(() => {
      triggerReadyToBeAMakerEventMock.mockRejectedValue(
        new Error("Oh oh, something happened")
      );
      fireEvent.click(getByLabelText("Home"));
    });

    it("still calls goToNextPage", async () => {
      await wait();
      fireEvent.click(getByText("Next"));

      await wait();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  });
});
