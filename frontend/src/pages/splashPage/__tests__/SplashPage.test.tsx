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
  let getByLabelText: BoundFunction<GetByBoundAttribute>;
  beforeEach(() => {
    triggerReadyToBeAMakerEventMock.mockResolvedValue("OK");

    defaultProps = {
      goToNextPage: jest.fn(),
    };

    ({
      container: languagePage,
      getByAltText,
      queryByText,
      getByLabelText,
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

  it("renders a selectable checkbox", () => {
    const checkboxLabel = "I'm a school"
    expect(queryByText(checkboxLabel)).toBeInTheDocument();
    expect(getByLabelText(checkboxLabel)).not.toBeChecked();
    fireEvent.click(getByLabelText(checkboxLabel));
    expect(getByLabelText(checkboxLabel)).toBeChecked();
  })

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

  describe('if user is a school', () => {
    beforeEach(() => {
      fireEvent.click(getByLabelText("I'm a school"));
    });

    it("calls goToNextPage when clicking 'yes' button", async () => {
      await wait();
      fireEvent.click(getByText("Yes"));

      await wait();
      expect(defaultProps.goToNextPage).toHaveBeenCalled();
    });
  });

});
