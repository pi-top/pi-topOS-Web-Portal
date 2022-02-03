import React from "react";
import {
  render,
  fireEvent,
  BoundFunction,
  GetByBoundAttribute,
  QueryByText,
  GetByText,
  RenderResult,
  QueryByBoundAttribute,
} from "@testing-library/react";

import RestartPage, { Props, ErrorMessage, ExplanationMessages } from "../RestartPage";

describe("RestartPage", () => {
  let defaultProps: Props;
  let restartPage: HTMLElement;
  let getByAltText: BoundFunction<GetByBoundAttribute>;
  let queryByText: BoundFunction<QueryByText>;
  let getByText: BoundFunction<GetByText>;
  let queryByTestId: BoundFunction<QueryByBoundAttribute>;
  let rerender: RenderResult["rerender"];
  beforeEach(() => {
    defaultProps = {
      onBackClick: jest.fn(),
      setupDevice: jest.fn(),
      isSettingUpDevice: false,
      progressPercentage: 0.5,
      progressMessage: "I am setting up",
      rebootError: false,
      globalError: false,
    };

    ({
      container: restartPage,
      getByAltText,
      queryByText,
      queryByTestId,
      getByText,
      rerender,
    } = render(<RestartPage {...defaultProps} />));
  });

  it("renders correct image", () => {
    expect(getByAltText("reboot-screen")).toMatchSnapshot();
  });

  it("renders prompt correctly", () => {
    const prompt = restartPage.querySelector(".prompt");
    expect(prompt).toMatchSnapshot();
  });

  it("renders explanation", () => {
    ExplanationMessages.OnBrowser.split('\n').map(function(item, _) {
      item && expect(getByText(item)).toBeInTheDocument();
    });
  });

  it("does not render error message", () => {
    expect(queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("renders restart button", () => {
    expect(queryByText("Restart")).toBeInTheDocument();
  });

  it("renders back button", () => {
    expect(queryByText("Back")).toBeInTheDocument();
  });

  it("does not render skip button", () => {
    expect(queryByText("Skip")).not.toBeInTheDocument();
  });

  it("calls onBackClick on back button click", () => {
    fireEvent.click(getByText("Back"));

    expect(defaultProps.onBackClick).toHaveBeenCalled();
  });

  it('calls setupDevice on restart button click', () => {
    fireEvent.click(getByText('Restart'));

    expect(defaultProps.setupDevice).toHaveBeenCalled();
  })

  describe("when isSettingUpDevice is true and progress info is passed", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        isSettingUpDevice: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders progress message", () => {
      expect(queryByText(defaultProps.progressMessage)).toBeInTheDocument();
    });

    it("renders progress bar correctly", () => {
      expect(restartPage.querySelector('.progress')).toMatchSnapshot();
    });

    it("disables the restart button", () => {
      expect(getByText("Restart").parentElement).toBeDisabled();
    });
  });

  describe("when rebootError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        rebootError: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.RebootError)).toBeInTheDocument();
    });

    it("disables restart button", () => {
      expect(queryByText("Restart")?.parentElement).toBeDisabled();
    });
  });

  describe("when globalError is true", () => {
    beforeEach(() => {
      defaultProps = {
        ...defaultProps,
        globalError: true,
      };

      rerender(<RestartPage {...defaultProps} />);
    });

    it("renders correct error message", () => {
      expect(queryByText(ErrorMessage.GlobalError)).toBeInTheDocument();
    });

    it("does not render skip button", () => {
      expect(queryByText("Skip")).not.toBeInTheDocument();
    });

    it("does not render back button", () => {
      expect(queryByText("Back")).not.toBeInTheDocument();
    })

    it("renders restart button", () => {
      expect(queryByText("Restart")).toBeInTheDocument();
    });

    it('calls setupDevice on restart button click', () => {
      fireEvent.click(getByText('Restart'));

      expect(defaultProps.setupDevice).toHaveBeenCalled();
    })
  });
});
